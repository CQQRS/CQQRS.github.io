$currentPath = Get-Location
Write-Host "Deploying to server..."
Write-Host $PSScriptRoot
Set-Location $PSScriptRoot/../server

$keyPath = (Convert-Path "~/.ssh/id_rsa")
$knownHostsPath = (Convert-Path "~/.ssh/known_hosts")
$target = "outerplanet@conryclan.com:~/conryclan.com/projects/cqqrsnet/api"
rsync -av -e "/usr/bin/ssh -i $keyPath -o UserKnownHostsFile=$knownHostsPath" `
	--include="*/" --include="*.php" --include=".htaccess" --exclude="*" `
	--chmod=D755,F644 `
	./ $target

Set-Location $currentPath
