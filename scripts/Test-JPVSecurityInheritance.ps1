[CmdletBinding()]
param([string]$RepositoryRoot)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) { $RepositoryRoot=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path }
function Fail([string]$m){ throw "JPV_SECURITY_INHERITANCE_FAILURE: $m" }
$manifestPath=Join-Path $RepositoryRoot 'governance/security/JPV-SECURITY-INHERITANCE.json'
if(-not(Test-Path -LiteralPath $manifestPath -PathType Leaf)){Fail 'security inheritance manifest missing'}
$m=Get-Content -LiteralPath $manifestPath -Raw|ConvertFrom-Json
if($m.status-ne'MANDATORY'){Fail 'status must be MANDATORY'}
if($m.operating_mode-ne'fail_closed'){Fail 'operating mode must be fail_closed'}
if($m.canonical_source-ne'JayPVentures-LLC/jpv-governance@75c2ca69a01aca4aaacdbe6bd168e94fe0f4bd84:governance/security/JPV-SECURITY-AGENT-FLEET.json'){Fail 'canonical security authority drift'}
$agents=@('JPV-SENTINEL','JPV-AEGIS','JPV-CIPHER','JPV-WARD','JPV-ORACLE','JPV-GATEKEEPER','JPV-FORENSIC')
foreach($a in $agents){if($a-notin$m.agents){Fail "missing security agent: $a"}}
foreach($r in @('security_state_observable','local_secret_scan','least_privilege','security_receipt_required','unverifiable_state_fails_closed','native_or_equivalent_security_evidence')){if($m.requirements.$r-ne$true){Fail "required security invariant disabled: $r"}}
$begin='-----BEGIN '
$end=' PRIVATE KEY-----'
$patterns=[ordered]@{
'PRIVATE_KEY_LEGACY'=$begin+'(RSA|OPENSSH|EC|DSA)'+$end
'PRIVATE_KEY_PKCS8'=$begin+$end.TrimStart()
'PRIVATE_KEY_ENCRYPTED'=$begin+'ENCRYPTED'+$end
'GITHUB_CLASSIC_TOKEN'='gh[pousr]_[A-Za-z0-9]{36,}'
'GITHUB_FINE_GRAINED_TOKEN'='github_pat_[A-Za-z0-9_]{50,}'
'AWS_ACCESS_KEY'='AKIA[0-9A-Z]{16}'
'GOOGLE_API_KEY'='AIza[0-9A-Za-z_-]{35}'
'STRIPE_LIVE_SECRET'='sk_live_[0-9A-Za-z]{16,}'
'STRIPE_LIVE_RESTRICTED'='rk_live_[0-9A-Za-z]{16,}'
'NPM_ACCESS_TOKEN'='npm_[A-Za-z0-9]{30,}'
'SLACK_TOKEN'='xox[baprs]-[A-Za-z0-9-]{20,}'
'DATABASE_URL_WITH_PASSWORD'='(?i)(postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s:@\/]+:[^\s@\/]+@'
'BASIC_AUTH_URL'='(?i)https?:\/\/[^\s:@\/]+:[^\s@\/]+@'
'PASSWORD_LITERAL'='(?i)\b(password|passwd|pwd)\b\s*[:=]\s*["''][^"'']{8,}["'']'
'SERVICE_ACCOUNT_PRIVATE_KEY'='(?i)"private_key"\s*:\s*"'+$begin+'(?:ENCRYPTED )?'+$end.TrimStart()
}
$exclude='scripts/Test-JPVSecurityInheritance.ps1'
$hits=New-Object System.Collections.Generic.List[string]
$files=@(& git -C $RepositoryRoot ls-files)
if($LASTEXITCODE-ne 0){Fail 'git tracked-file inventory failed'}
foreach($rel in $files){if($rel-eq$exclude){continue};$p=Join-Path $RepositoryRoot $rel;if(-not(Test-Path -LiteralPath $p -PathType Leaf)){continue};try{$text=Get-Content -LiteralPath $p -Raw -ErrorAction Stop}catch{continue};foreach($entry in $patterns.GetEnumerator()){if($text-match$entry.Value){$hits.Add("$rel [$($entry.Key)]")}}}
if($hits.Count-gt0){Fail "credential/private-key exposure detected in tracked paths: $($hits -join ', ')"}
[ordered]@{status='PASS';control_id='JPV-SECURITY-INHERITANCE-001';agents=$agents.Count;tracked_files_scanned=$files.Count;credential_findings=0;signature_classes=$patterns.Count;validated_at_utc=[DateTime]::UtcNow.ToString('o')}|ConvertTo-Json