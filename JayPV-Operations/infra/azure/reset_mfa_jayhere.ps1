<#
JPV-OS EXECUTION PROFILE
brand: jaypventures_llc
layer: enterprise
classification: mfa_reset
authority_required: global_admin
enforcement: strict
#>

# =========================
# RESET MFA FOR USER (Entra/Azure AD)
# =========================

# Install and import Microsoft Graph module if needed
if (-not (Get-Module -ListAvailable -Name Microsoft.Graph)) {
    Install-Module -Name Microsoft.Graph -Scope CurrentUser -Force
}
Import-Module Microsoft.Graph

# Connect to Microsoft Graph with required permissions
Connect-MgGraph -Scopes "UserAuthenticationMethod.ReadWrite.All"

# Set user principal name
$userPrincipalName = "jayhere@jaypventuresllc.com"

# Get user object ID
$user = Get-MgUser -UserId $userPrincipalName
$userId = $user.Id

# List all authentication methods for the user
$methods = Get-MgUserAuthenticationMethod -UserId $userId

# Remove all authentication methods
foreach ($method in $methods) {
    Write-Host "Removing method: $($method.Id) for $userPrincipalName"
    Remove-MgUserAuthenticationMethod -UserId $userId -AuthenticationMethodId $method.Id
}

Write-Host "All MFA methods removed for $userPrincipalName. The user must re-register MFA at next sign-in."

