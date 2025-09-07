<#
Interactive Docker helper for PowerShell
Usage: .\scripts\docker_menu.ps1
#>

function Show-Menu {
    Clear-Host
    Write-Host "================== Docker helper - Cuentas Claras =================="
    Write-Host "1) Build & Up (detached)"
    Write-Host "2) Up (detached)"
    Write-Host "3) Build only"
    Write-Host "4) Down (remove volumes)"
    Write-Host "5) Logs (follow)"
    Write-Host "6) Exec shell in API container"
    Write-Host "7) Run tests locally (requires node installed)"
    Write-Host "8) Run tests in container (may require dev deps)"
    Write-Host "9) Import DB schema from base/schema.sql into running DB"
    Write-Host "0) Exit"
}

while ($true) {
    Show-Menu
    $choice = Read-Host 'Choose an option [0-9]'
    switch ($choice) {
        '1' { docker compose up --build -d; Read-Host 'Done. Press Enter to continue' }
        '2' { docker compose up -d; Read-Host 'Done. Press Enter to continue' }
        '3' { docker compose build; Read-Host 'Done. Press Enter to continue' }
        '4' { docker compose down -v --remove-orphans; Read-Host 'Done. Press Enter to continue' }
        '5' { docker compose logs -f --tail=200 }
        '6' { docker compose exec api sh }
        '7' { if (Test-Path package.json) { npm test } else { Write-Host 'package.json not found.' } ; Read-Host 'Done. Press Enter to continue' }
        '8' { docker compose run --rm --service-ports --entrypoint "npm test" api; Read-Host 'Done. Press Enter to continue' }
        '9' {
            if (-Not (Test-Path 'base/schema.sql')) { Write-Host 'schema file not found: base/schema.sql'; Read-Host 'Press Enter'; break }
            Write-Host 'Importing base/schema.sql into MySQL container db...'
            Get-Content base/schema.sql -Raw | docker compose exec -T db mysql -u$env:DB_USER -p$env:DB_PASSWORD $env:DB_NAME
            Read-Host 'Import finished. Press Enter to continue'
        }
        '0' { break }
        default { Write-Host 'Invalid choice'; Read-Host 'Press Enter' }
    }
}
