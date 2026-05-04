#!/bin/sh

# Set PM2 home directory to local directory
export PM2_HOME=./.pm2

# Create PM2 directories if they don't exist
mkdir -p ./.pm2/logs
mkdir -p ./.pm2/pids
mkdir -p ./.pm2/modules

# Start PM2 with the ecosystem file
exec pm2-runtime start ecosystem.config.js 