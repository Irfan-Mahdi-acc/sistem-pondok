module.exports = {
  apps: [{
    name: 'siakad-tsn',
    script: '.next/standalone/server.js',
    cwd: '/var/www/siakad.tsn.ponpes.id',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/var/www/logs/siakad-error.log',
    out_file: '/var/www/logs/siakad-out.log',
    log_file: '/var/www/logs/siakad-combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Restart delay
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    // Advanced features
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true
  }]
}
