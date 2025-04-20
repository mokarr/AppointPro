# Script: setup-stripe-environment.ps1
# Purpose: Set up Stripe development environment and create products for Appoint Pro

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js before continuing." -ForegroundColor Red
    exit 1
}

# Check for required environment variables
$envFile = ".env"
$requiredKeys = @(
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
)

Write-Host "Checking environment variables..." -ForegroundColor Yellow
$needUpdate = $false
$envContent = Get-Content $envFile -ErrorAction SilentlyContinue
$envVars = @{}

# Parse current .env file
if ($envContent) {
    foreach ($line in $envContent) {
        if ($line -match '^\s*([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $envVars[$key] = $value
        }
    }
}

# Check for missing environment variables
foreach ($key in $requiredKeys) {
    if (-not $envVars.ContainsKey($key) -or $envVars[$key] -match "YOUR_") {
        Write-Host "Warning: $key is not set correctly" -ForegroundColor Yellow
        $needUpdate = $true
    }
}

if ($needUpdate) {
    Write-Host "Please enter your Stripe API keys (available at https://dashboard.stripe.com/apikeys)" -ForegroundColor Yellow
    
    $stripeSecretKey = Read-Host "Enter your Stripe SECRET key (starts with sk_test_)"
    $stripePublishableKey = Read-Host "Enter your Stripe PUBLISHABLE key (starts with pk_test_)"
    
    # Update environment variables
    if ($stripeSecretKey -ne "") {
        $envVars["STRIPE_SECRET_KEY"] = $stripeSecretKey
    }
    
    if ($stripePublishableKey -ne "") {
        $envVars["STRIPE_PUBLISHABLE_KEY"] = $stripePublishableKey
        $envVars["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] = $stripePublishableKey
    }
    
    # Write back to .env file
    $newEnvContent = @()
    foreach ($line in $envContent) {
        $updatedLine = $line
        if ($line -match '^\s*([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            if ($envVars.ContainsKey($key)) {
                $updatedLine = "$key=$($envVars[$key])"
                $envVars.Remove($key)
            }
        }
        $newEnvContent += $updatedLine
    }
    
    # Add any new keys that weren't in the original file
    foreach ($key in $envVars.Keys) {
        $newEnvContent += "$key=$($envVars[$key])"
    }
    
    $newEnvContent | Set-Content $envFile
    Write-Host "Updated .env file with new values" -ForegroundColor Green
}

# Define the path to the Stripe CLI executable
$stripeCLI = "C:\Users\moham\Downloads\stripe_1.26.1_windows_x86_64\stripe.exe"

# Check if Stripe CLI is available
Write-Host "Checking for Stripe CLI..." -ForegroundColor Yellow
try {
    $stripeVersion = & $stripeCLI --version
    Write-Host "Stripe CLI detected: $stripeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Stripe CLI not found at $stripeCLI. Please download and install the Stripe CLI." -ForegroundColor Red
    exit 1
}

# Install Stripe Node.js SDK
Write-Host "Checking if Stripe Node.js SDK is installed..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$stripeInstalled = $false

if ($packageJson.dependencies.stripe) {
    Write-Host "Stripe SDK found in package.json (version $($packageJson.dependencies.stripe))" -ForegroundColor Green
    $stripeInstalled = $true
} else {
    Write-Host "Stripe SDK not found in package.json. Installing..." -ForegroundColor Yellow
    npm install stripe --save
    Write-Host "Stripe SDK installed successfully" -ForegroundColor Green
}

# Check if already authenticated
Write-Host "Checking Stripe authentication..." -ForegroundColor Yellow
$loginTest = & $stripeCLI config
if ($loginTest -match "not logged in") {
    # Authenticate with Stripe CLI
    Write-Host "Authenticating with Stripe CLI..." -ForegroundColor Yellow
    Write-Host "Please complete the authentication process in your browser when prompted." -ForegroundColor Yellow
    & $stripeCLI login
} else {
    Write-Host "Already authenticated with Stripe" -ForegroundColor Green
}

# Create Stripe Products and Prices
Write-Host "Creating Stripe products and prices..." -ForegroundColor Yellow

# Function to create a product and its price
function Create-StripeProduct {
    param (
        [string]$name,
        [string]$description,
        [int]$amount,
        [string]$interval = "month",
        [string]$currency = "eur"
    )
    
    Write-Host "Creating product: $name..." -ForegroundColor Yellow
    
    # Create the product
    $product = & $stripeCLI products create --name="$name" --description="$description"
    
    # Extract the product ID
    $productId = ($product | Select-String -Pattern '"id": "prod_[^"]*"' | Out-String).Trim() -replace '"id": "([^"]*)"', '$1'
    
    if (-not $productId) {
        Write-Host "Error: Could not extract product ID" -ForegroundColor Red
        return $null
    }
    
    # Create a price for the product - fixed command with proper syntax
    $price = & $stripeCLI prices create --unit-amount=$amount --currency=$currency --recurring.interval=$interval --product=$productId
    
    # Extract the price ID
    $priceId = ($price | Select-String -Pattern '"id": "price_[^"]*"' | Out-String).Trim() -replace '"id": "([^"]*)"', '$1'
    
    if (-not $priceId) {
        Write-Host "Error: Could not extract price ID" -ForegroundColor Red
        return $null
    }
    
    Write-Host "Created product: $name with ID: $productId" -ForegroundColor Green
    Write-Host "Created price with ID: $priceId" -ForegroundColor Green
    
    return @{
        productId = $productId
        priceId = $priceId
    }
}

# Create the products as defined in the README-STRIPE-SETUP.md
$basicPlan = Create-StripeProduct -name "Basic Plan" -description "Access to basic appointment scheduling features" -amount 1999 -currency "eur"
$proPlan = Create-StripeProduct -name "Pro Plan" -description "Advanced features for growing businesses" -amount 4999 -currency "eur"
$enterprisePlan = Create-StripeProduct -name "Enterprise Plan" -description "Full-featured solution for larger organizations" -amount 9999 -currency "eur"

# Create a temporary file to store the price IDs
$priceIdsFile = "stripe-price-ids.txt"
"Basic Plan: $($basicPlan.priceId)" | Out-File $priceIdsFile
"Pro Plan: $($proPlan.priceId)" | Out-File $priceIdsFile -Append
"Enterprise Plan: $($enterprisePlan.priceId)" | Out-File $priceIdsFile -Append

Write-Host "Price IDs have been saved to $priceIdsFile" -ForegroundColor Green
Write-Host "Please update these IDs in src/services/stripe-subscription.ts" -ForegroundColor Yellow

# Provide instructions for next steps
Write-Host "`n======= NEXT STEPS =======" -ForegroundColor Cyan
Write-Host "1. Update your src/services/stripe-subscription.ts file with the price IDs from $priceIdsFile" -ForegroundColor White
Write-Host "2. Run 'npm run db:seed-plans' to initialize subscription plans in your database" -ForegroundColor White
Write-Host "3. Start your Next.js development server with 'npm run dev'" -ForegroundColor White
Write-Host "==========================" -ForegroundColor Cyan

# Provide information about webhook listener
Write-Host "`nTo listen for webhooks, run:" -ForegroundColor Yellow
Write-Host "$stripeCLI listen --forward-to http://localhost:3000/api/webhooks/stripe" -ForegroundColor White 