module.exports = {
  apps: [
    {
      // Application name
      name: "ttn-app",

      // Start script
      script: "npm",
      args: "start",

      // Working directory
      cwd: "/var/www/ttn",

      // Execution mode: 'cluster' or 'fork'
      exec_mode: "fork",

      // Number of instances (use cluster mode for multiple)
      instances: 1,

      // Environment variables for production
      env: {
        NODE_ENV: "production",
        PORT: 6001,
      },

      // Auto restart
      autorestart: true,

      // Watch mode (disable in production)
      watch: false,

      // Ignore watch patterns
      ignore_watch: ["node_modules", ".next", "public"],

      // Max memory restart (500 MB)
      max_memory_restart: "500M",

      // Log files
      error_file: "/var/log/pm2/ttn-error.log",
      out_file: "/var/log/pm2/ttn-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,

      // Restart delays
      listen_timeout: 6001,
      kill_timeout: 5000,

      // Max restarts and uptime
      max_restarts: 10,
      min_uptime: "10s",

      // Process name for monitoring
      instance_var: "INSTANCE_ID",

      // Graceful shutdown
      shutdown_with_message: true,

      // Custom metrics
      pmx: true,
    },
  ],

  // Deployment configuration
  deploy: {
    production: {
      // SSH user
      user: "root",

      // VPS IP or domain
      host: "your_vps_ip",

      // Git repository
      ref: "origin/main",
      repo: "https://github.com/yourusername/your-repo.git",

      // Deployment path
      path: "/var/www/ttn",

      // Post-deploy commands
      "post-deploy":
        "npm install --production --legacy-peer-deps && npm run build && pm2 restart ecosystem.config.cjs --env production",

      // Pre-deploy local commands
      "pre-deploy-local": 'echo "Starting deployment to production"',
    },
  },
};
