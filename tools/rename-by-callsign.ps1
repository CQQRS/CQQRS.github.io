<#
.SYNOPSIS
    Renames files that contain a valid callsign prefix to just the callsign
    with an incrementing number per callsign.

.PARAMETER InputDir
    Folder containing files to rename.

.PARAMETER DryRun
    Preview renames without modifying any files.

.EXAMPLE
    .\rename-by-callsign.ps1 C:\photos
    .\rename-by-callsign.ps1 C:\photos -DryRun
#>
param(
    [Parameter(Mandatory, Position = 0)]
    [string] $InputDir,

    [switch] $DryRun
)

# Matches VK/ZL callsigns (digit + 2-4 alphanumeric suffix) and M0 callsigns
$pattern = '(?i)(VK[0-9][A-Z0-9]{2,4}|ZL[0-9][A-Z0-9]{2,4}|M0[A-Z0-9]{2,4}|G4[A-Z0-9]{2,4}|D[LJ][A-Z0-9]{2,4}|LU[A-Z0-9]{2,4}|YB[A-Z0-9]{2,4})'
$counters = @{}
$renamed = 0
$skipped = 0
$deleted = 0
$outDir  = Join-Path $InputDir "renamed"

foreach ($file in Get-ChildItem -Path $InputDir -File | Sort-Object Name) {
    if ($file.Name -notmatch $pattern) {
        Write-Verbose "No callsign: $($file.Name)"
        
		if ($DryRun) {
        	Write-Host "[dry-run] $($file.Name) -> DELETE"
    	}
		else {
			Remove-Item -Path $file.FullName
		}

		$deleted++

		continue
    }

    $callsign = $Matches[1].ToUpper()
    $counters[$callsign] = ($counters[$callsign] ?? 0) + 1
	$extension = ($file.Extension -eq ".jpg" -or $file.Extension -eq ".jpeg") ? ".jpg" : $file.Extension
    $newName  = "${callsign}_$($counters[$callsign])$($extension)"
    $dest     = Join-Path $outDir $newName

    if ($DryRun) {
        Write-Host "[dry-run] $($file.Name) -> renamed\$newName"
    } elseif (Test-Path $dest) {
        Write-Warning "Skip '$($file.Name)': 'renamed\$newName' already exists"
        $skipped++
    } else {
        if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
        Copy-Item -Path $file.FullName -Destination $dest
        Write-Host "$($file.Name) -> renamed\$newName"
        $renamed++
    }
}

$total = ($counters.Values | Measure-Object -Sum).Sum ?? 0
$verb  = if ($DryRun) { 'Would rename' } else { 'Renamed' }
Write-Host "`n$verb $total file(s) across $($counters.Count) callsign(s)$(if ($skipped) { "; $skipped skipped (conflict)" }) $(if ($deleted) { "; $deleted deleted (no callsign)" })."`
