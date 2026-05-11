// JPV-OS Azure Monetization Stack
// Resource Group: rg-jpv-prod-monetization
// Provisions: Container Apps, Functions, Storage, Cosmos DB, Application Insights

targetScope = 'resourceGroup'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Environment tag (prod/staging)')
param env string = 'prod'

@description('Container image for jpv-api-gateway (e.g. jpvprodacr.azurecr.io/jpv-api-gateway:latest)')
param gatewayImage string

@description('Container image for jpv-event-processor function app')
param processorImage string = ''

// ─── Application Insights ────────────────────────────────────────────────────

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'jpv-observability-logs'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
  tags: { env: env, project: 'jpv-os' }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'jpv-observability'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
  tags: { env: env, project: 'jpv-os' }
}

// ─── Storage Account + Queues ────────────────────────────────────────────────

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'jpvprodstorage'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
  }
  tags: { env: env, project: 'jpv-os' }
}

resource queueService 'Microsoft.Storage/storageAccounts/queueServices@2023-01-01' = {
  parent: storage
  name: 'default'
}

resource stripeEventsQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2023-01-01' = {
  parent: queueService
  name: 'stripe-events'
}

resource auditLogsQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2023-01-01' = {
  parent: queueService
  name: 'audit-logs'
}

// ─── Cosmos DB Serverless ─────────────────────────────────────────────────────

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: 'jpv-entitlements-db'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    capabilities: [
      { name: 'EnableServerless' }
    ]
    backupPolicy: {
      type: 'Continuous'
      continuousModeProperties: { tier: 'Continuous7Days' }
    }
  }
  tags: { env: env, project: 'jpv-os' }
}

resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmosAccount
  name: 'jpv-entitlements-db'
  properties: {
    resource: { id: 'jpv-entitlements-db' }
  }
}

var cosmosContainers = [
  { name: 'entitlements', partitionKey: '/subject_id' }
  { name: 'customers',    partitionKey: '/stripe_customer_id' }
  { name: 'audit_events', partitionKey: '/subject_id' }
  { name: 'products',     partitionKey: '/product_id' }
]

resource cosmosContainerResources 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = [for c in cosmosContainers: {
  parent: cosmosDatabase
  name: c.name
  properties: {
    resource: {
      id: c.name
      partitionKey: {
        paths: [ c.partitionKey ]
        kind: 'Hash'
      }
      defaultTtl: -1
    }
  }
}]

// ─── Container Apps Environment ───────────────────────────────────────────────

resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'jpv-prod-cae'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
  tags: { env: env, project: 'jpv-os' }
}

// ─── jpv-api-gateway Container App ───────────────────────────────────────────

resource apiGateway 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'jpv-api-gateway'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
        allowInsecure: false
      }
      secrets: [
        { name: 'cosmos-connection', value: cosmosAccount.listConnectionStrings().connectionStrings[0].connectionString }
        { name: 'storage-connection', value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value};EndpointSuffix=core.windows.net' }
        { name: 'appinsights-connection', value: appInsights.properties.ConnectionString }
      ]
    }
    template: {
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: { metadata: { concurrentRequests: '50' } }
          }
        ]
      }
      containers: [
        {
          name: 'jpv-api-gateway'
          image: gatewayImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'NODE_ENV',                   value: env }
            { name: 'PORT',                        value: '3000' }
            { name: 'COSMOS_CONNECTION',           secretRef: 'cosmos-connection' }
            { name: 'STORAGE_CONNECTION',          secretRef: 'storage-connection' }
            { name: 'STRIPE_EVENTS_QUEUE',         value: stripeEventsQueue.name }
            { name: 'APPINSIGHTS_CONNECTION',      secretRef: 'appinsights-connection' }
            // Inject from GitHub Secrets at deploy time:
            { name: 'STRIPE_WEBHOOK_SECRET',       value: '' }
            { name: 'STRIPE_SECRET_KEY',           value: '' }
            { name: 'DISCORD_BOT_TOKEN',           value: '' }
            { name: 'DISCORD_GUILD_ID',            value: '' }
            { name: 'DISCORD_ROLE_COMMUNITY_ID',   value: '' }
            { name: 'DISCORD_ROLE_VIP_ID',         value: '' }
            { name: 'JWT_SECRET',                  value: '' }
          ]
        }
      ]
    }
  }
  tags: { env: env, project: 'jpv-os' }
}

// ─── jpv-event-processor Azure Function (Consumption) ────────────────────────

resource functionPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: 'jpv-event-processor-plan'
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {
    reserved: true
  }
  tags: { env: env, project: 'jpv-os' }
}

resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: 'jpv-event-processor'
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: functionPlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20'
      appSettings: [
        { name: 'FUNCTIONS_EXTENSION_VERSION',              value: '~4' }
        { name: 'FUNCTIONS_WORKER_RUNTIME',                 value: 'node' }
        { name: 'AzureWebJobsStorage',                      value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value};EndpointSuffix=core.windows.net' }
        { name: 'APPINSIGHTS_INSTRUMENTATIONKEY',           value: appInsights.properties.InstrumentationKey }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING',    value: appInsights.properties.ConnectionString }
        { name: 'COSMOS_CONNECTION',                        value: cosmosAccount.listConnectionStrings().connectionStrings[0].connectionString }
        { name: 'STRIPE_EVENTS_QUEUE_CONNECTION',           value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${storage.listKeys().keys[0].value};EndpointSuffix=core.windows.net' }
        { name: 'STRIPE_SECRET_KEY',                        value: '' }
        { name: 'DISCORD_BOT_TOKEN',                        value: '' }
        { name: 'DISCORD_GUILD_ID',                         value: '' }
        { name: 'DISCORD_ROLE_COMMUNITY_ID',                value: '' }
        { name: 'DISCORD_ROLE_VIP_ID',                      value: '' }
      ]
    }
    httpsOnly: true
  }
  tags: { env: env, project: 'jpv-os' }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output gatewayUrl string = 'https://${apiGateway.properties.configuration.ingress.fqdn}'
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
output storageAccountName string = storage.name
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output functionAppName string = functionApp.name
