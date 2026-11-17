$src = Join-Path $PSScriptRoot "../server/api/" 
$target = "outerplanet@conryclan.com:~/conryclan.com/projects/cqqrsnet/api"

Write-Host "Deploying to server..."
Write-Host "Src: $src"
Write-Host "Dst: $target"

$currentPath = Get-Location
Set-Location $src

# SSH setup
$keyPath = (Convert-Path "~/.ssh/id_rsa")
$knownHostsPath = (Convert-Path "~/.ssh/known_hosts")
$keyAlgorithm = "curve25519-sha256@libssh.org,curve25519-sha256"
$sshArg = "/usr/bin/ssh -i $keyPath -o UserKnownHostsFile=$knownHostsPath -o KexAlgorithms=$keyAlgorithm"

rsync -av --delete `
    -e $sshArg `
    --chmod=D755,F644 `
    ./ $target

Set-Location $currentPath