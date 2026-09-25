const { Client } = require('pg');
const bcrypt = require('bcryptjs');

require('dotenv').config();
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

async function seed() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Terhubung ke database...");

    const email = "test@example.com";
    const password = "password123";
    const name = "User Tester";
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    // Insert user
    await client.query(`
      INSERT INTO users (id, name, email, password_hash) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, [userId, name, email, passwordHash]);

    console.log("✅ Seeder berhasil!");
    console.log("-----------------------------------------");
    console.log("Anda sekarang bisa login dengan akun:");
    console.log("Email    : " + email);
    console.log("Password : " + password);
    console.log("-----------------------------------------");
    
  } catch (err) {
    console.error("Gagal melakukan seed:", err.message);
  } finally {
    await client.end();
  }
}

seed();
