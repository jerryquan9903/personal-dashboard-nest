export default () => ({
  host: process.env.SERVER_HOST,
  port: parseInt(process.env.SERVER_PORT, 10) || 8081,
})