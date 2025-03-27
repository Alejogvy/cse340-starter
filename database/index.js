const { Pool } = require("pg");
require("dotenv").config();

// Configuración mejorada del pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// Función de query con mejor manejo de errores
module.exports = {
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Query executed', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Error in query', { 
        text, 
        params, 
        error: error.message,
        stack: error.stack 
      });
      throw new Error(`Database error: ${error.message}`);
    }
  },
  
  // Para cerrar la conexión cuando sea necesario
  async close() {
    await pool.end();
  }
};