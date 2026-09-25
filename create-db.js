const { Client } = require("pg");

async function createDb() {
  // Connect to the default 'postgres' database
  const client = new Client({
    connectionString: "postgresql://postgres:@127.0.0.1:5432/postgres",
  });

  try {
    await client.connect();
    console.log("Terhubung ke server database DBngin...");
    
    await client.query("CREATE DATABASE app_db");
    console.log("✅ Berhasil! Database 'app_db' sudah dibuat.");
  } catch (error) {
    if (error.code === '42P04') {
      console.log("✅ Database 'app_db' ternyata sudah ada (sudah berhasil dibuat sebelumnya).");
    } else {
      console.error("Gagal membuat database:", error.message);
    }
  } finally {
    await client.end();
  }
}

createDb();
