const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db"
});

client.connect()
  .then(() => {
    console.log("Connected to DB successfully");
    return client.query('SELECT current_database();');
  })
  .then(res => console.log(res.rows))
  .catch(err => console.error("Connection error:", err.message))
  .finally(() => client.end());
