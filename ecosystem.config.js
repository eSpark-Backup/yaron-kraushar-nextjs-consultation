export const apps = [{
  name: "jimple-server",
  script: "npm",
  args: "run prod",
  env: {
    NODE_ENV: 'production',
    NEXT_PUBLIC_BASE_URL: 'https://jimple.io'
  }
}];