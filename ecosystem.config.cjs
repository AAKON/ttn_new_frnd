module.exports = {
  apps: [
    {
      name: 'wqms',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};