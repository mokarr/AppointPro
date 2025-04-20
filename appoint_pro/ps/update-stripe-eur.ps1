# Update Stripe to EUR Script
# This script will:
# 1. Create new Stripe products and prices in EUR
# 2. Update the price IDs in the codebase
# 3. Update the plans in the database

# Check if Node.js is installed
$nodeVersion = node -v
if (-not $?) {
    Write-Host "Error: Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}
Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Green

# Check if Stripe CLI is installed
$stripeVersion = stripe --version
if (-not $?) {
    Write-Host "Error: Stripe CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}
Write-Host "Stripe CLI detected: $stripeVersion" -ForegroundColor Green

# Check if Stripe is authenticated
$stripeLogin = stripe whoami
if (-not $?) {
    Write-Host "Error: Not authenticated with Stripe. Please run 'stripe login' first." -ForegroundColor Red
    exit 1
}
Write-Host "Stripe authentication verified" -ForegroundColor Green

# Create products and prices in EUR
Write-Host "`nCreating Stripe products and prices in EUR..." -ForegroundColor Yellow

# Define the plans
$plans = @(
    @{
        name = "Basic Plan"
        description = "Access to basic appointment scheduling features"
        amount = 1999
    },
    @{
        name = "Pro Plan"
        description = "Advanced features for growing businesses"
        amount = 4999
    },
    @{
        name = "Enterprise Plan"
        description = "Full-featured solution for larger organizations"
        amount = 9999
    }
)

# Create products and prices
$results = @{}
foreach ($plan in $plans) {
    Write-Host "Creating product: $($plan.name)..." -ForegroundColor Yellow
    
    # Create product
    $product = stripe products create --name="$($plan.name)" --description="$($plan.description)"
    $productId = ($product | Select-String -Pattern '"id": "prod_[^"]*"' | Out-String).Trim() -replace '"id": "([^"]*)"', '$1'
    
    if (-not $productId) {
        Write-Host "Error: Could not extract product ID" -ForegroundColor Red
        exit 1
    }
    
    # Create price in EUR
    $price = stripe prices create --unit-amount=$($plan.amount) --currency=eur --recurring.interval=month --product=$productId
    $priceId = ($price | Select-String -Pattern '"id": "price_[^"]*"' | Out-String).Trim() -replace '"id": "([^"]*)"', '$1'
    
    if (-not $priceId) {
        Write-Host "Error: Could not extract price ID" -ForegroundColor Red
        exit 1
    }
    
    $results[$plan.name] = @{
        productId = $productId
        priceId = $priceId
    }
    
    Write-Host "Created product: $($plan.name) with ID: $productId" -ForegroundColor Green
    Write-Host "Created price with ID: $priceId" -ForegroundColor Green
}

# Update the stripe-subscription.ts file
Write-Host "`nUpdating stripe-subscription.ts with new price IDs..." -ForegroundColor Yellow

$stripeSubscriptionFile = "src/services/stripe-subscription.ts"
$content = Get-Content $stripeSubscriptionFile -Raw

# Update each price ID
foreach ($plan in $plans) {
    $oldPattern = "stripePriceId: `"price_[^`"]*`""
    $newPattern = "stripePriceId: `"$($results[$plan.name].priceId)`""
    $content = $content -replace $oldPattern, $newPattern
}

# Save the updated file
$content | Set-Content $stripeSubscriptionFile
Write-Host "Updated stripe-subscription.ts with new price IDs" -ForegroundColor Green

# Update the database
Write-Host "`nUpdating subscription plans in database..." -ForegroundColor Yellow

# Create a temporary JavaScript file to update the database
$tempJsFile = "temp-update-plans.js"
@"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Updating subscription plans in database...');

        const plans = [
            {
                name: 'Basic Plan',
                description: 'Access to basic appointment scheduling features',
                price: 19.99,
                interval: 'month',
                stripePriceId: '$($results['Basic Plan'].priceId)',
                features: JSON.stringify([
                    'Up to 2 employees',
                    'Basic appointment scheduling',
                    'Email notifications',
                ]),
                active: true,
            },
            {
                name: 'Pro Plan',
                description: 'Advanced features for growing businesses',
                price: 49.99,
                interval: 'month',
                stripePriceId: '$($results['Pro Plan'].priceId)',
                features: JSON.stringify([
                    'Up to 10 employees',
                    'Advanced appointment scheduling',
                    'SMS notifications',
                    'Custom branding',
                ]),
                active: true,
            },
            {
                name: 'Enterprise Plan',
                description: 'Full-featured solution for larger organizations',
                price: 99.99,
                interval: 'month',
                stripePriceId: '$($results['Enterprise Plan'].priceId)',
                features: JSON.stringify([
                    'Unlimited employees',
                    'Priority support',
                    'Advanced analytics',
                    'API access',
                    'Custom integrations',
                ]),
                active: true,
            },
        ];

        // First, delete all existing plans
        await prisma.subscriptionPlan.deleteMany({});

        // Then create the new plans
        for (const plan of plans) {
            console.log(\`Creating plan: \${plan.name}\`);
            await prisma.subscriptionPlan.create({
                data: plan
            });
        }

        console.log('Subscription plans updated successfully.');
    } catch (error) {
        console.error('Error updating subscription plans:', error);
        process.exit(1);
    } finally {
        await prisma.\$disconnect();
    }
}

main();
"@ | Set-Content $tempJsFile

# Run the JavaScript file to update the database
node $tempJsFile

# Clean up
Remove-Item $tempJsFile

Write-Host "`n======= COMPLETED =======" -ForegroundColor Green
Write-Host "1. Created new Stripe products and prices in EUR" -ForegroundColor White
Write-Host "2. Updated price IDs in stripe-subscription.ts" -ForegroundColor White
Write-Host "3. Updated subscription plans in database" -ForegroundColor White
Write-Host "==========================" -ForegroundColor Green 