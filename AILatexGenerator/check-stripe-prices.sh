#!/bin/bash

# This script checks your Stripe prices and products for tax configuration
# It will help verify if your prices are set to tax_behavior: "inclusive"
# and if your products have the correct tax_code for digital services

# Basic tier price check
echo "Checking Basic tier price configuration..."
BASIC_PRICE_ID=$STRIPE_PRICE_TIER1_ID
if [ -n "$BASIC_PRICE_ID" ]; then
  echo "Basic price ID: $BASIC_PRICE_ID"
  curl -s "https://api.stripe.com/v1/prices/$BASIC_PRICE_ID" \
    -u "$STRIPE_SECRET_KEY:" | grep -E "tax_behavior|product"
  
  # Get product ID for this price
  PRODUCT_ID=$(curl -s "https://api.stripe.com/v1/prices/$BASIC_PRICE_ID" \
    -u "$STRIPE_SECRET_KEY:" | grep -o '"product": "[^"]*' | cut -d'"' -f4)
  
  if [ -n "$PRODUCT_ID" ]; then
    echo "Checking Basic tier product with ID: $PRODUCT_ID"
    curl -s "https://api.stripe.com/v1/products/$PRODUCT_ID" \
      -u "$STRIPE_SECRET_KEY:" | grep "tax_code"
  fi
else
  echo "Basic tier price ID not found in environment variables"
fi

# Refill pack price check
echo -e "\nChecking Refill Pack price configuration..."
REFILL_PRICE_ID=$STRIPE_PRICE_REFILL_PACK_ID
if [ -n "$REFILL_PRICE_ID" ]; then
  echo "Refill pack price ID: $REFILL_PRICE_ID"
  curl -s "https://api.stripe.com/v1/prices/$REFILL_PRICE_ID" \
    -u "$STRIPE_SECRET_KEY:" | grep -E "tax_behavior|product"
  
  # Get product ID for this price
  PRODUCT_ID=$(curl -s "https://api.stripe.com/v1/prices/$REFILL_PRICE_ID" \
    -u "$STRIPE_SECRET_KEY:" | grep -o '"product": "[^"]*' | cut -d'"' -f4)
  
  if [ -n "$PRODUCT_ID" ]; then
    echo "Checking Refill Pack product with ID: $PRODUCT_ID"
    curl -s "https://api.stripe.com/v1/products/$PRODUCT_ID" \
      -u "$STRIPE_SECRET_KEY:" | grep "tax_code"
  fi
else
  echo "Refill pack price ID not found in environment variables"
fi

echo -e "\nIMPORTANT NOTES:"
echo "1. If tax_behavior is missing or set to 'exclusive', you should create new prices with tax_behavior: 'inclusive'"
echo "2. If tax_code is missing, you should set it to 'txcd_10000000' for digital services"
echo "3. You cannot modify tax_behavior on existing prices - you must create new ones if needed"