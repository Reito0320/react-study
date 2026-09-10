export function localDatabaseUrl(value = process.env.DATABASE_URL): string {
  if (!value) throw new Error('DATABASE_URL がありません。.env.example を .env にコピーしてください。')
  const url = new URL(value)
  if (!['postgresql:', 'postgres:'].includes(url.protocol) ||
      !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
      url.searchParams.has('host')) {
    throw new Error('この教材はローカルPostgreSQL専用です。接続先をlocalhostにしてください。')
  }
  return value
}
