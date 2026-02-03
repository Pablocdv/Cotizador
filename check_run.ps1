$max = 120
for ($i=0; $i -lt $max; $i++) {
  try {
    $runs = Invoke-RestMethod 'https://api.github.com/repos/Pablocdv/Cotizador/actions/runs' -UseBasicParsing
  } catch {
    Write-Output "Error fetching runs: $_"
    Start-Sleep -Seconds 5
    continue
  }
  $r = $runs.workflow_runs[0]
  Write-Output ("[{0}] id={1} status={2} conclusion={3} updated={4}" -f (Get-Date -Format HH:mm:ss), $r.id, $r.status, $r.conclusion, $r.updated_at)
  if ($r.status -eq 'completed') { break }
  Start-Sleep -Seconds 5
}
if (-not $r) { Write-Output 'No run found'; exit 1 }
if ($r.status -ne 'completed') { Write-Output 'TIMEOUT waiting for run to complete'; exit 2 }
Write-Output "Run finished: id=$($r.id) conclusion=$($r.conclusion)"
$jobs = Invoke-RestMethod ("https://api.github.com/repos/Pablocdv/Cotizador/actions/runs/$($r.id)/jobs") -UseBasicParsing
$jobs.jobs | Select-Object id,name,status,conclusion,html_url | ConvertTo-Json -Depth 5
