export default () => ({
  port: parseInt(process.env.SERVER_PORT, 10) || 8081,
})