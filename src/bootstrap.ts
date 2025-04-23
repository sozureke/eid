import { execSync } from 'child_process'

export async function applyMigrations() {
  try {
    console.log('📦 Running Prisma migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    console.log('✅ Migrations applied')
  } catch (err) {
    console.error('❌ Failed to apply migrations', err)
    process.exit(1)
  }
}
