Object.assign(process.env, {
  NODE_ENV: 'test',
  APP_ENV: 'test',
  SKIP_ENV_VALIDATION: '1',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  LOG_LEVEL: 'silent',
})
