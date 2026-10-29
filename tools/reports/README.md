# Reporting Automation

## Adding reports to RagChew.

### 1. Download and generate the reports
Run the following script, once you've updated the $edition and $contributors

```powershell
# Set the week
$edition = "2026/44"

# Collect the callsigns of those who've submitted articles
$contributors = "VK7TO ..."

# download reports
$ bun ./tools/downloadReports.ts $edition

# Build the reports
bun ./tools/reports/generateReports.ts $edition $contributors 
```

### 2. Insert reports into Ragchew
1. Open each generated report (log and soapbox) and view source.
2. Copy the root element `logtable-root` and `soapbox-root` from the respective 
sources.
3. Paste the HTML into the Ragchew's *Source Code* component.



## Report Generation Tools

### DownloadReports

Use this tool to download the reporting form's data.  The downloaded data will
be saved to `./data/reports/<year>_<week>.json`.

```powershell
# Usage: bun ./tools/downloadReports.ts <year>/<week>

$ bun ./tools/downloadReports.ts 2026/44
```

### GenerateReports

Use this tool to perform the following tasks:
1. Build the QSO table
2. Build the Soapbox reports
3. Display QSO metrics (?? reports were received, showing ?? CQQRS members who 
workedand heard ?? stations)
3. Display contributors

The Reverse log and Soapbox are saved to `C:/users/lance/temp`

```powershell 
# Usage: bun ./tools/reports/generateReports.ts <year>/<week> "<extra contributors>"

bun ./tools/reports/generateReports.ts 2026/44 "L1PB, VK3DBD M0NNK VK1DA"
```