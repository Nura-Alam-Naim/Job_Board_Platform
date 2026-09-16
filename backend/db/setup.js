const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function setupDatabase() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Allow executing multiple queries from schema file
  };

  try {
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection(connectionConfig);
    
    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema script...');
    await connection.query(schema);

    console.log('Database schema created successfully.');
    await connection.end();
  } catch (error) {
    console.error('Error setting up the database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
