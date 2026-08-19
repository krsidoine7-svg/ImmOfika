import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function check() {
  try {
    const existing = await sql`SELECT * FROM auth.users WHERE email = 'krsidoine7@gmail.com' LIMIT 1`
    console.log("Existing working auth.user:", existing[0])
    
    const ourNewUser = await sql`SELECT * FROM auth.users WHERE email = 'admin.general@favorcompany.ci' LIMIT 1`
    console.log("Our new auth.user:", ourNewUser[0])

    process.exit(0)
  } catch (err: any) {
    console.error("Error:", err.message)
    process.exit(1)
  }
}

check()
