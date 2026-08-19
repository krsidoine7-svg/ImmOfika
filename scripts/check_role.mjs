import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

// Corriger le rôle de admin.juridique en 'admin'
const result = await sql`
  UPDATE profiles 
  SET role = 'admin' 
  WHERE email = 'admin.juridique@favorcompany.ci'
  RETURNING id, email, full_name, role
`

if (result.length > 0) {
  console.log('✅ Rôle mis à jour avec succès !')
  console.log('Email:', result[0].email)
  console.log('Nouveau rôle:', result[0].role)
} else {
  console.log('❌ Aucun profil trouvé')
}

await sql.end()
