'use strict'

/**
 * Config values used to connect to PostgreSQL
 * @module DatabaseConfig
 */

// Unlike the other config files we need to directly reference dotenv. It is because this config is used when we run
// migrations. The rest of the config is only used when we run the app. `app/server.js` loads dotenv which makes it
// available to everything else thereafter
require('dotenv').config()

const config = {
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  testDatabase: process.env.POSTGRES_DB_TEST
}

module.exports = config
