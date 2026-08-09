$ErrorActionPreference = 'Stop'

$frontendRoot = Split-Path -Parent $PSScriptRoot
$envFiles = @('.env.development', '.env.harmony')

foreach ($envFile in $envFiles)
{
    $target = Join-Path $frontendRoot $envFile
    $example = "$target.example"

    if (-not (Test-Path -LiteralPath $target))
    {
        if (-not (Test-Path -LiteralPath $example))
        {
            throw "Environment template not found: $example"
        }

        Copy-Item -LiteralPath $example -Destination $target
        Write-Output "Created $envFile from $([System.IO.Path]::GetFileName($example) )"
    }
}
