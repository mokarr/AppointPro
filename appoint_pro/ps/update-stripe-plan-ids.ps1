# Script: update-stripe-plan-ids.ps1
# Purpose: Update the Stripe price IDs in the stripe-subscription.ts file

# Check if the price IDs file exists
$priceIdsFile = "stripe-price-ids.txt"
if (-not (Test-Path $priceIdsFile)) {
    Write-Host "Error: $priceIdsFile not found. Please run setup-stripe-environment.ps1 first." -ForegroundColor Red
    exit 1
}

# Read the price IDs from the file
$priceIds = @{}
$priceIdContent = Get-Content $priceIdsFile

foreach ($line in $priceIdContent) {
    if ($line -match '(.*?): (.*)') {
        $planName = $matches[1].Trim()
        $priceId = $matches[2].Trim()
        $priceIds[$planName] = $priceId
    }
}

# Check if we found all required price IDs
if (-not $priceIds.ContainsKey("Basic Plan") -or 
    -not $priceIds.ContainsKey("Pro Plan") -or 
    -not $priceIds.ContainsKey("Enterprise Plan")) {
    Write-Host "Error: Not all required price IDs were found in $priceIdsFile" -ForegroundColor Red
    exit 1
}

# Find the stripe-subscription.ts file
$stripeSubFile = "src/services/stripe-subscription.ts"
if (-not (Test-Path $stripeSubFile)) {
    Write-Host "Error: $stripeSubFile not found." -ForegroundColor Red
    exit 1
}

# Read the file content
$fileContent = Get-Content $stripeSubFile -Raw

# Create backup
$backupFile = "$stripeSubFile.bak"
Copy-Item $stripeSubFile $backupFile
Write-Host "Created backup at $backupFile" -ForegroundColor Green

# Update the price IDs in the file
$updatedContent = $fileContent

# Update Basic Plan
$updatedContent = $updatedContent -replace '(stripePriceId: .[^"]*price_basic_monthly.[^"]*|stripePriceId: ."price_basic_monthly")', "stripePriceId: `"$($priceIds['Basic Plan'])`""

# Update Pro Plan
$updatedContent = $updatedContent -replace '(stripePriceId: .[^"]*price_pro_monthly.[^"]*|stripePriceId: ."price_pro_monthly")', "stripePriceId: `"$($priceIds['Pro Plan'])`""

# Update Enterprise Plan
$updatedContent = $updatedContent -replace '(stripePriceId: .[^"]*price_enterprise_monthly.[^"]*|stripePriceId: ."price_enterprise_monthly")', "stripePriceId: `"$($priceIds['Enterprise Plan'])`""

# Write the updated content back to the file
$updatedContent | Set-Content $stripeSubFile

# Verify the changes
$newContent = Get-Content $stripeSubFile -Raw
if ($newContent -match $priceIds['Basic Plan'] -and 
    $newContent -match $priceIds['Pro Plan'] -and 
    $newContent -match $priceIds['Enterprise Plan']) {
    Write-Host "Successfully updated price IDs in $stripeSubFile" -ForegroundColor Green
    
    # Show what was updated
    Write-Host "`nPrice IDs updated:" -ForegroundColor Cyan
    Write-Host "Basic Plan: $($priceIds['Basic Plan'])" -ForegroundColor White
    Write-Host "Pro Plan: $($priceIds['Pro Plan'])" -ForegroundColor White
    Write-Host "Enterprise Plan: $($priceIds['Enterprise Plan'])" -ForegroundColor White
    
    # Next steps
    Write-Host "`n======= NEXT STEPS =======" -ForegroundColor Cyan
    Write-Host "1. Run 'npm run db:seed-plans' to initialize subscription plans in your database" -ForegroundColor White
    Write-Host "2. Start your Next.js development server with 'npm run dev'" -ForegroundColor White
    Write-Host "==========================" -ForegroundColor Cyan
} else {
    Write-Host "Warning: Not all price IDs were updated in $stripeSubFile" -ForegroundColor Yellow
    Write-Host "Please check the file manually and update the stripePriceId values:" -ForegroundColor Yellow
    Write-Host "Basic Plan: $($priceIds['Basic Plan'])" -ForegroundColor White
    Write-Host "Pro Plan: $($priceIds['Pro Plan'])" -ForegroundColor White
    Write-Host "Enterprise Plan: $($priceIds['Enterprise Plan'])" -ForegroundColor White
} 