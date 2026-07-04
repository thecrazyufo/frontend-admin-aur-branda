#!/bin/bash
echo "🧹 Cleaning Next.js project..."

rm -rf node_modules
rm -rf .next
rm -rf build
rm -rf dist
rm -rf .turbo
rm -rf coverage

echo "✅ Next.js project cleaned successfully!"
echo "Ab aap zip kar sakte ho ya git push kar sakte ho."