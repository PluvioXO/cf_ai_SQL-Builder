#!/bin/bash

# SQL Query Builder - Setup Script
# This script will help you set up the project quickly

echo "🚀 SQL Query Builder - Cloudflare AI Stack"
echo "=========================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
else
    echo "✅ Wrangler found"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if logged in to Cloudflare
echo ""
echo "🔐 Checking Cloudflare authentication..."
if npx wrangler whoami &> /dev/null; then
    echo "✅ Already logged in to Cloudflare"
else
    echo "❌ Not logged in. Opening login..."
    npx wrangler login
fi

# Create KV namespace
echo ""
echo "🗄️ Creating KV namespace for schema cache..."
KV_OUTPUT=$(npx wrangler kv:namespace create SCHEMA_CACHE 2>&1)
echo "$KV_OUTPUT"

# Extract KV ID (this is a simple approach, may need adjustment)
KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | head -1 | cut -d'"' -f2)

if [ ! -z "$KV_ID" ]; then
    echo ""
    echo "✅ KV Namespace created with ID: $KV_ID"
    echo ""
    echo "⚠️  IMPORTANT: Update wrangler.toml with this ID:"
    echo "   [[kv_namespaces]]"
    echo "   binding = \"SCHEMA_CACHE\""
    echo "   id = \"$KV_ID\""
    echo ""
else
    echo "⚠️  Could not extract KV ID. Please check the output above."
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update wrangler.toml with your KV namespace ID (if not already done)"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:8787 in your browser"
echo ""
echo "Happy coding! 🎉"
