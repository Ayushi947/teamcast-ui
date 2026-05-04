#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Log cleanup configuration
const LOG_DIR = './logs';
const MAX_LOG_SIZE = 50 * 1024 * 1024; // 50MB per log file
const MAX_LOG_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

function cleanupLogs() {
  console.log('🧹 Starting log cleanup...');

  if (!fs.existsSync(LOG_DIR)) {
    console.log('📁 Logs directory does not exist, skipping cleanup');
    return;
  }

  const files = fs.readdirSync(LOG_DIR);
  let totalCleaned = 0;
  let totalSizeSaved = 0;

  files.forEach((file) => {
    const filePath = path.join(LOG_DIR, file);
    const stats = fs.statSync(filePath);

    // Check file size
    if (stats.size > MAX_LOG_SIZE) {
      console.log(
        `📄 Truncating large log file: ${file} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`
      );

      // Keep only the last 10MB of the file
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const keepLines = Math.floor((10 * 1024 * 1024) / 100); // Rough estimate
      const truncatedContent = lines.slice(-keepLines).join('\n');

      fs.writeFileSync(filePath, truncatedContent);
      totalSizeSaved += stats.size - truncatedContent.length;
      totalCleaned++;
    }

    // Check file age
    const fileAge = Date.now() - stats.mtime.getTime();
    if (fileAge > MAX_LOG_AGE) {
      console.log(
        `🗑️  Removing old log file: ${file} (${Math.floor(fileAge / 24 / 60 / 60 / 1000)} days old)`
      );
      fs.unlinkSync(filePath);
      totalCleaned++;
    }
  });

  console.log(`✅ Log cleanup completed!`);
  console.log(`📊 Files processed: ${totalCleaned}`);
  console.log(`💾 Space saved: ${(totalSizeSaved / 1024 / 1024).toFixed(2)}MB`);
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupLogs();
}

module.exports = { cleanupLogs };
