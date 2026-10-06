param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

Add-Type -AssemblyName System.Drawing
$sourceDirectory = Join-Path $ProjectRoot 'art-source\banh-mi-v1'
$outputDirectory = Join-Path $ProjectRoot 'client\public\art\banh-mi\v1'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$report = @()
foreach ($sourceFile in Get-ChildItem -LiteralPath $sourceDirectory -Filter '*.png') {
    $sourceBitmap = [System.Drawing.Bitmap]::new($sourceFile.FullName)
    $edge = if ($sourceFile.BaseName.StartsWith('customer-')) { 384 } else { 320 }
    $scale = [Math]::Min($edge / $sourceBitmap.Width, $edge / $sourceBitmap.Height)
    $width = [Math]::Max(1, [int]($sourceBitmap.Width * $scale))
    $height = [Math]::Max(1, [int]($sourceBitmap.Height * $scale))
    $bitmap = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    # Fit the ENTIRE independent sprite canvas. No cropping or background removal.
    $graphics.DrawImage($sourceBitmap, 0, 0, $width, $height)
    $destination = Join-Path $outputDirectory $sourceFile.Name
    $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
    $report += [PSCustomObject]@{ name = $sourceFile.Name; width = $width; height = $height; alphaCorner = $bitmap.GetPixel(0, 0).A; bytes = (Get-Item -LiteralPath $destination).Length }
    $graphics.Dispose()
    $bitmap.Dispose()
    $sourceBitmap.Dispose()
}
$report | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $outputDirectory 'manifest.json') -Encoding utf8
$report | Format-Table -AutoSize
