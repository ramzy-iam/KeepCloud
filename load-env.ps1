# load-env.ps1

$envFile = "../../.env"

if (-Not (Test-Path $envFile)) {
    Write-Error "Env file not found at path: $envFile"
    exit 1
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line.StartsWith("#") -and $line -match '^(.*?)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim('"').Trim()
        Set-Item -Path "Env:${name}" -Value $value
        # Write-Host "Loaded $name=$value"
    }
}
