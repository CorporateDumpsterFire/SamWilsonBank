# SamWilsonBank KYC Application

A user registration and KYC (Know Your Customer) verification application built with React and deployed on AWS serverless infrastructure.

## Architecture

- **Frontend**: React 19 + Vite, deployed to S3 + CloudFront CDN
- **Backend**: AWS Lambda + API Gateway (HTTP API)
- **KYC Provider**: Alloy API integration

## Project Structure

```
SamWilsonBank/
├── FrontEnd/                 # React application
│   ├── src/
│   │   └── components/
│   │       └── UserRegistrationForm.jsx
│   └── package.json
├── BackEnd/                  # Original Express server (reference)
│   └── server.js
└── infrastructure/           # AWS SAM deployment
    ├── lambda/
    │   └── evaluations/
    │       └── index.js      # Lambda handler
    ├── template.yaml         # SAM template
    └── deploy.sh             # Deployment script
```

## Setup

### Prerequisites

- Node.js 20.x+
- AWS CLI configured
- AWS SAM CLI (`brew install aws-sam-cli`)

### Environment Variables

Copy the example files and fill in your credentials:

```bash
cp BackEnd/.env.example BackEnd/.env
cp infrastructure/env.json.example infrastructure/env.json
```

### Local Development

**Frontend:**
```bash
cd FrontEnd
npm install
npm run dev
```

**Backend (local):**
```bash
cd BackEnd
npm install
npm start
```

**Backend (SAM local):**
```bash
cd infrastructure
sam local start-api --env-vars env.json
```

## Deployment

```bash
cd infrastructure
export $(grep -v '^#' ../BackEnd/.env | xargs)
./deploy.sh
```

This will:
1. Build and deploy Lambda + API Gateway
2. Create S3 bucket and CloudFront distribution
3. Build frontend with production API URL
4. Upload to S3 and invalidate CloudFront cache

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/evaluations | Submit KYC evaluation |

## Cleanup

To delete all AWS resources:

```bash
sam delete --stack-name samwilsonbank
```
