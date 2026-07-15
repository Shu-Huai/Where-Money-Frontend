$ErrorActionPreference = 'Stop'

$frontendRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $frontendRoot 'dist'
$target = Join-Path $frontendRoot 'harmony-app\entry\src\main\resources\rawfile\www'

if (-not (Test-Path -LiteralPath $source)) {
  throw "Vue build output not found: $source. Run npm run harmony:build first."
}

if (Test-Path -LiteralPath $target) {
  Remove-Item -LiteralPath $target -Recurse -Force
}

New-Item -ItemType Directory -Path $target -Force | Out-Null
Get-ChildItem -LiteralPath $source -Force | Copy-Item -Destination $target -Recurse -Force

# rawfile pages can reject external subresources under a resource:// origin.
# Inline the generated JS and CSS into the Harmony copy of index.html.
$indexPath = Join-Path $target 'index.html'
$html = [System.IO.File]::ReadAllText($indexPath)

$scriptMatches = [regex]::Matches($html, '<script[^>]+src="(?<src>\./assets/[^"'']+\.js)"[^>]*></script>')
foreach ($match in $scriptMatches) {
  $relative = $match.Groups['src'].Value -replace '^\./', ''
  $scriptPath = Join-Path $target $relative
  $content = [System.IO.File]::ReadAllText($scriptPath)
  $html = $html.Replace($match.Value, "<script type=`"module`">`n$content`n</script>")
}

$styleMatches = [regex]::Matches($html, '<link[^>]+href="(?<href>\./assets/[^"'']+\.css)"[^>]*>')
foreach ($match in $styleMatches) {
  $relative = $match.Groups['href'].Value -replace '^\./', ''
  $stylePath = Join-Path $target $relative
  $content = [System.IO.File]::ReadAllText($stylePath)
  $html = $html.Replace($match.Value, "<style>`n$content`n</style>")
}

[System.IO.File]::WriteAllText($indexPath, $html, [System.Text.UTF8Encoding]::new($false))
Write-Output "Synced HarmonyOS Web assets to $target"
