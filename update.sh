#!/bin/bash

# Display commands as they are executed
set -x

# Stash any changes
git stash

# Pull the latest changes from the repository
git pull

# Get the current git commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)

# Create a temporary build directory
TEMP_BUILD_DIR="temp_build_${COMMIT_HASH}"
echo "Creating temporary build directory: $TEMP_BUILD_DIR"
mkdir -p $TEMP_BUILD_DIR

# Copy configuration files and source directories
cp package.json pnpm-lock.yaml tsconfig.json next.config.* postcss.config.mjs .npmrc next-env.d.ts components.json $TEMP_BUILD_DIR/ 2>/dev/null || true
# Copy standard Next.js directories
cp -r src public .env* $TEMP_BUILD_DIR/ 2>/dev/null || true
cd $TEMP_BUILD_DIR

# Remove node_modules directory
echo "Removing node_modules directory..."
rm -rf node_modules

# Install dependencies
echo "Installing dependencies..."
if ! command -v pnpm &> /dev/null; then
    echo "pnpm is not installed. Please install it first."
    cd ..
    rm -rf $TEMP_BUILD_DIR
    exit 1
fi
pnpm install

# Build the project
echo "Building in temporary directory..."
if pnpm run build; then

    echo "Build successful, replacing current build..."
    cd ..

    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        echo "PM2 is not installed. Please install it first."
        rm -rf $TEMP_BUILD_DIR
        exit 1
    fi

    # Stop the application
    pm2 stop teamcast-ui || true

    # Create a backup directory if it doesn't exist
    BACKUP_DIR="build_backups"
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "Creating backup directory: $BACKUP_DIR"
        mkdir -p $BACKUP_DIR
    fi

    # Backup current build (optional)
    if [ -d "build" ]; then
        mv build "$BACKUP_DIR/build_backup_${COMMIT_HASH}"
    fi

    # Move new build to main directory
    mv $TEMP_BUILD_DIR build

    # Navigate to the build directory
    cd build

    # Restart the application using PM2
    pm2 restart teamcast-ui || pm2 start npm --name teamcast-ui -- start

    # Print the status of the application
    pm2 status teamcast-ui

    echo "Deployment completed successfully!"

else

    echo "Build failed, cleaning up temporary directory..."
    cd ..
    rm -rf $TEMP_BUILD_DIR
    exit 1

fi

# Clean up stashed changes if any
git stash pop || true
