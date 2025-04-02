const bcrypt = require('bcryptjs');
const pool = require('../database/');

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const existingEmail = await checkExistingEmail(account_email);
    if (existingEmail > 0) {
      throw new Error('This email address is already registered. Please use another one.');
    }

    // Hash the password before storing it (Asynchronous version)
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, hashedPassword]);
    
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting account:", error);
    throw new Error("Account registration failed. Please try again.");
  }
}

/* **********************
 *   Check existing email
 * ********************** */
async function checkExistingEmail(account_email) {
    try {
      const sql = 'SELECT * FROM account WHERE account_email = $1';
      const result = await pool.query(sql, [account_email]);
      return result.rowCount;
    } catch (error) {
      console.error('Error checking email:', error);
      throw error;
    }
}

module.exports = { registerAccount, checkExistingEmail };
