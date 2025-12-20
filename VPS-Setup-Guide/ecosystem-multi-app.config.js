module.exports = {
  apps: [
    // Main Application - Sistem Pondok
    {
      name: 'sistem-pondok',
      cwd: '/var/www/sistem-pondok',
      script: 'node',
      args: '.next/standalone/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      error_file: '/var/www/logs/sistem-pondok-error.log',
      out_file: '/var/www/logs/sistem-pondok-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true
    },
    
    // Radio Application
    {
      name: 'radio-tsn',
      cwd: '/var/www/radio-tsn',
      script: 'node',
      args: '.next/standalone/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '0.0.0.0'
      },
      error_file: '/var/www/logs/radio-tsn-error.log',
      out_file: '/var/www/logs/radio-tsn-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 3000
    },
    
    // PSB Subdomain Application
    {
      name: 'psb-subdomain',
      cwd: '/var/www/psb-subdomain',
      script: 'node',
      args: '.next/standalone/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOSTNAME: '0.0.0.0'
      },
      error_file: '/var/www/logs/psb-subdomain-error.log',
      out_file: '/var/www/logs/psb-subdomain-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 3000
    }
  ]
}
