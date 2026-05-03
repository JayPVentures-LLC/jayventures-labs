param()

$targets = @(
  @{ Example = 'c:\dev\jayventures-labs\operations\entitlement-system\.dev.vars.example'; Output = 'c:\dev\jayventures-labs\operations\entitlement-system\.dev.vars' },
  @{ Example = 'c:\dev\jayventures-labs\wix\bookings\.dev.vars.example'; Output = 'c:\dev\jayventures-labs\wix\bookings\.dev.vars' }
)

foreach ($target in $targets) {
  if (-not (Test-Path -LiteralPath $target.Example)) {
    Write-Warning "Missing example file: $($target.Example)"
    continue
  }

  if (Test-Path -LiteralPath $target.Output) {
    Write-Host "Exists: $($target.Output)"
    continue
  }

  Copy-Item -LiteralPath $target.Example -Destination $target.Output
  Write-Host "Created: $($target.Output)"
}
