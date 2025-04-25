#!/bin/bash
# Deploy script for Change My Letters application

# Set error handling
set -e

# Display banner
echo "============================================="
echo "  Change My Letters - Deployment Script"
echo "============================================="
echo

# Check if we're in the project root directory
if [ ! -f "package.json" ]; then
  echo "Error: Must run this script from the project root directory"
  exit 1
fi

# Display project info
echo "Project: $(node -e "console.log(require('./package.json').name)")"
echo "Version: $(node -e "console.log(require('./package.json').version)")"
echo

# Check for uncommitted changes
echo "Checking git status..."
if [[ $(git status --porcelain) ]]; then
  echo "Warning: You have uncommitted changes in your working directory."
  echo "It's recommended to commit or stash changes before deploying."
  read -p "Continue anyway? (y/n): " CONTINUE
  if [[ "$CONTINUE" != "y" ]]; then
    echo "Deployment aborted."
    exit 1
  fi
else
  echo "Git status: clean"
fi
echo

# Run the deploy script from package.json
echo "Running deploy script (typecheck, lint, test, build)..."
npm run deploy
if [ $? -ne 0 ]; then
  echo "Error: Build process failed. Please fix errors and try again."
  exit 1
fi
echo "Build completed successfully."
echo

# Create dist directory if it doesn't exist
DIST_DIR="dist"
if [ ! -d "$DIST_DIR" ]; then
  echo "Creating distribution directory..."
  mkdir -p $DIST_DIR
fi

# Move build files to distribution directory
echo "Copying build files to $DIST_DIR directory..."
cp -r dist/* $DIST_DIR/ 2>/dev/null || true
echo

# Deployment instructions
echo "============================================="
echo "  Deployment Instructions"
echo "============================================="
echo
echo "Your application has been built and is ready for deployment."
echo
echo "To deploy to a static web hosting service:"
echo "1. Upload the contents of the '$DIST_DIR' directory to your web host"
echo "2. Ensure your host is configured to serve index.html for all routes"
echo
echo "For local testing, you can serve the build with:"
echo "npx serve -s $DIST_DIR"
echo
echo "Deployment package is ready!"
echo "============================================="