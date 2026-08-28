import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function checkFooterConfig() {
  const rows = await sql`SELECT section, content FROM public.homepage_configs WHERE section = 'footer';`
  console.log("=== DB CONTENT FOR FOOTER SECTION ===")
  console.log(JSON.stringify(rows, null, 2))
  await sql.end()
}

checkFooterConfig()
