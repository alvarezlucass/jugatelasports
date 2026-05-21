Add-Type -AssemblyName System.Drawing
$srcPath = "f:\PredictionGames\Predicciones\public\Escudo.jpg"
$destPath192 = "f:\PredictionGames\Predicciones\public\pwa-192x192.png"
$destPath512 = "f:\PredictionGames\Predicciones\public\pwa-512x512.png"

# Helper to resize and save
function Resize-Image($src, $dest, $w, $h) {
    $bmp = [System.Drawing.Image]::FromFile($src)
    $newBmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($bmp, 0, 0, $w, $h)
    $newBmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $newBmp.Dispose()
    $bmp.Dispose()
}

Resize-Image $srcPath $destPath192 192 192
Resize-Image $srcPath $destPath512 512 512
Write-Output "Successfully converted and resized images!"
