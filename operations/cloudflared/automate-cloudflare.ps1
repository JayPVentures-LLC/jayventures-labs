# PowerShell script to automate Cloudflare Access policy management with Terraform

# 1. Set your Cloudflare API token
$apiToken = Read-Host -Prompt "Enter your Cloudflare API token"
$headers = @{ "Authorization" = "Bearer $apiToken" }

# 2. Fetch your Cloudflare Account ID
Write-Host "Fetching Cloudflare Account ID..."
$response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts" -Headers $headers
$account = $response.result | Select-Object -First 1
$accountId = $account.id
Write-Host "Account ID: $accountId"

# 3. Fetch your Access Application ID
Write-Host "Fetching Access Application IDs..."
$response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/access/apps" -Headers $headers
$response.result | ForEach-Object { Write-Host ("App: {0} | ID: {1} | Domain: {2}" -f $_.name, $_.id, $_.domain) }
$applicationId = Read-Host -Prompt "Enter the Application ID to use"

# 4. Update main.tf with the correct values
$tfPath = "main.tf"
$tfContent = Get-Content $tfPath -Raw
$tfContent = $tfContent -replace 'api_token = ".*?"', 'api_token = "' + $apiToken + '"'
$tfContent = $tfContent -replace 'account_id\s*=\s*".*?"', 'account_id = "' + $accountId + '"'
$tfContent = $tfContent -replace 'application_id\s*=\s*".*?"', 'application_id = "' + $applicationId + '"'
Set-Content $tfPath $tfContent
Write-Host "Updated main.tf with new values."

# 5. Run Terraform automation
Write-Host "Running terraform init..."
Start-Process -NoNewWindow -Wait terraform init
Write-Host "Running terraform apply..."
Start-Process -NoNewWindow -Wait terraform apply

Write-Host "Automation complete!"
