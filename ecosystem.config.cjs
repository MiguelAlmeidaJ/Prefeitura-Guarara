// PM2 executa os artefatos compilados (npm run build).
// A API lê DATABASE_URL e JWT_SECRET de apps/api/.env.
// Use nomes e caminhos independentes do sistema operacional.
const path = require('node:path');

module.exports = {
  apps: [
    {
      name: 'guarara-api',
      cwd: path.join(__dirname, 'apps', 'api'),
      script: path.join(__dirname, 'apps', 'api', 'dist', 'main.js'),
      interpreter: process.execPath,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      restart_delay: 3000,
      min_uptime: '10s',
      max_restarts: 15,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: '3007',
        WEB_ORIGIN: 'http://localhost:3006',
      },
    },
    {
      name: 'guarara-web',
      cwd: path.join(__dirname, 'apps', 'web'),
      script: require.resolve('next/dist/bin/next'),
      args: ['start', '-p', '3006', '-H', '0.0.0.0'],
      interpreter: process.execPath,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: '3006',
        API_URL: 'http://127.0.0.1:3007',
      },
    },
  ],
};
