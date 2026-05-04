#!/bin/bash

# Teamcast Convex Setup Script
# This script helps set up the Convex development environment

echo "🚀 Setting up Convex for Teamcast notifications..."

# Check if Convex CLI is installed
if ! command -v npx convex &> /dev/null; then
    echo "❌ Convex CLI not found. Installing..."
    npm install -g convex
fi

# Load environment variables from .env file
if [ -f ".env" ]; then
    echo "📄 Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# Check if environment variables are set
if [ -z "$NEXT_CONVEX_SELF_HOSTED_URL" ]; then
    echo "⚠️  Warning: NEXT_CONVEX_SELF_HOSTED_URL not set in environment"
    echo "   Please add this to your .env file:"
    echo "   NEXT_CONVEX_SELF_HOSTED_URL=https://your-convex-deployment.convex.cloud"
else
    echo "✅ NEXT_CONVEX_SELF_HOSTED_URL is configured: $NEXT_CONVEX_SELF_HOSTED_URL"
fi

if [ -z "$CONVEX_SELF_HOSTED_ADMIN_KEY" ]; then
    echo "⚠️  Warning: CONVEX_SELF_HOSTED_ADMIN_KEY not set in environment"
    echo "   Please add this to your .env file:"
    echo "   CONVEX_SELF_HOSTED_ADMIN_KEY=your-admin-key"
else
    echo "✅ CONVEX_SELF_HOSTED_ADMIN_KEY is configured"
fi

# Initialize Convex if not already done
if [ ! -f "convex.json" ]; then
    echo "📁 Initializing Convex configuration..."
    npx convex init --yes
fi

# Generate types
echo "🔧 Generating Convex types..."
npx convex dev --once

# Check if the schema is valid
echo "✅ Validating Convex schema..."
npx convex dev --once

echo ""
echo "✅ Convex setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set your environment variables in .env:"
echo "   NEXT_CONVEX_SELF_HOSTED_URL=https://your-convex-deployment.convex.cloud"
echo "   CONVEX_SELF_HOSTED_ADMIN_KEY=your-admin-key"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. In another terminal, start Convex development:"
echo "   npx convex dev"
echo ""
echo "4. Test notifications using the demo component"
echo ""
echo "🎉 Happy coding!" 