module.exports = {
  apps: [
    {
      // Optimized for Vertex AI operations - Memory-focused configuration
      // Reduced instances to allocate more memory per process for AI workloads
      name: 'teamcast-ui',
      script: 'pnpm',
      args: 'start',
      instances: 1, // Reduce instances to allocate more memory per process
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Performance optimizations for Vertex AI operations
      max_memory_restart: '2000M', // Higher memory limit for AI operations (2GB)
      node_args: '--max-old-space-size=2048', // Increase heap size for AI workloads

      // PM2 specific optimizations
      watch: false, // Disable file watching in production
      ignore_watch: ['node_modules', 'logs', '*.log'],

      // Logging - Space optimized
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Log rotation and size limits
      log_type: 'json', // More compact JSON format
      merge_logs: true, // Merge stdout and stderr
      // Disable verbose logging in production
      log_level: 'error', // Only log errors and warnings

      // Auto restart settings
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,

      // Process management
      kill_timeout: 5000,
      listen_timeout: 3000,

      // Environment variables for Next.js optimization
      env_production: {
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_DISABLE_TARGET_CACHE: 'true',
        // Vertex AI optimizations
        NODE_OPTIONS: '--max-old-space-size=2048',
        UV_THREADPOOL_SIZE: '64', // Increase thread pool for concurrent operations
      },
    },
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/teamcast-ui.git',
      path: '/var/www/teamcast-ui',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
    },
  },
};
