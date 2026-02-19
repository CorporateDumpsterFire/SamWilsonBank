#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== SamWilsonBank AWS Deployment ==="
echo ""

# Check for required environment variables
if [ -z "$ALLOY_API_KEY" ] || [ -z "$ALLOY_API_SECRET" ]; then
    echo "Error: Required environment variables not set."
    echo "Please set: ALLOY_API_KEY, ALLOY_API_SECRET, ALLOY_WORKFLOW_TOKEN, ALLOY_ENTITY_TOKEN"
    echo ""
    echo "You can source them from BackEnd/.env:"
    echo "  export \$(grep -v '^#' ../BackEnd/.env | xargs)"
    exit 1
fi

# Default values
ALLOY_API_URL="${ALLOY_API_URL:-https://sandbox.alloy.co/v1/evaluations}"
ALLOY_WORKFLOW_TOKEN="${ALLOY_WORKFLOW_TOKEN:-$ALLOY_API_KEY}"
ALLOY_ENTITY_TOKEN="${ALLOY_ENTITY_TOKEN:-}"

cd "$SCRIPT_DIR"

# Build SAM application
echo "Building SAM application..."
sam build

# Deploy SAM application
echo ""
echo "Deploying SAM application..."
sam deploy \
    --no-confirm-changeset \
    --parameter-overrides \
        AlloyApiUrl="$ALLOY_API_URL" \
        AlloyApiKey="$ALLOY_API_KEY" \
        AlloyApiSecret="$ALLOY_API_SECRET" \
        AlloyWorkflowToken="$ALLOY_WORKFLOW_TOKEN" \
        AlloyEntityToken="$ALLOY_ENTITY_TOKEN"

# Get stack outputs
echo ""
echo "Retrieving stack outputs..."
API_URL=$(aws cloudformation describe-stacks \
    --stack-name samwilsonbank \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text)

BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name samwilsonbank \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
    --output text)

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name samwilsonbank \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' \
    --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name samwilsonbank \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

echo "API URL: $API_URL"
echo "S3 Bucket: $BUCKET_NAME"
echo "CloudFront URL: $CLOUDFRONT_URL"
echo "Distribution ID: $DISTRIBUTION_ID"

# Build frontend with production API URL
echo ""
echo "Building frontend..."
cd "$PROJECT_ROOT/FrontEnd"
echo "VITE_API_URL=${API_URL}/api/evaluations" > .env.production
npm run build

# Deploy frontend to S3
echo ""
echo "Deploying frontend to S3..."
aws s3 sync dist/ "s3://$BUCKET_NAME/" --delete

# Invalidate CloudFront cache
echo ""
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --output text

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Application URL: $CLOUDFRONT_URL"
echo "API Endpoint: $API_URL"
echo ""
echo "Test the health endpoint:"
echo "  curl ${API_URL}/health"
