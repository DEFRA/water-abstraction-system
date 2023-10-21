'use strict'

const DatabaseConfig = require('./config/database.config.js')

const defaultConfig = {
  client: 'postgres',
  useNullAsDefault: true,
  migrations: {
    tableName: 'knex_migrations',
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  }
}

const defaultConnection = {
  host: DatabaseConfig.host,
  user: DatabaseConfig.user,
  password: DatabaseConfig.password,
  database: DatabaseConfig.database,
  port: DatabaseConfig.port,
  charset: 'utf8'
}

const development = {
  ...defaultConfig,
  connection: defaultConnection
}

const test = {
  ...defaultConfig,
  pool: { min: 0, idleTimeoutMillis: 500 },
  connection: {
    ...defaultConnection,
    database: DatabaseConfig.testDatabase
  }
}

const production = {
  ...defaultConfig,
  connection: defaultConnection
}

module.exports = { development, test, production }
