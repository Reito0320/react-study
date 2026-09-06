import { createApp } from './app.ts'

const port = 3001
const server = createApp().listen(port, '127.0.0.1', () => {
  console.info(`Express learning server: http://127.0.0.1:${port}`)
})

server.on('error', (error) => {
  console.error('Express サーバーを起動できませんでした。', error.message)
  process.exitCode = 1
})
