'use strict'

const DatabaseConfig = require('./config/database.config.js')

const defaultConfig = {
  client: 'postgres',
  useNullAsDefault: true,
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
  migrations: {
    tableName: 'knex_migrations',
    directory: './db/migrations/public'
  },
  connection: defaultConnection
}

const test = {
  ...defaultConfig,
  migrations: {
    sortDirsSeparately: true,
    tableName: 'knex_migrations',
    directory: ['./db/migrations/legacy', './db/migrations/public']
  },
  connection: {
    ...defaultConnection,
    database: DatabaseConfig.testDatabase
  },
  pool: {
    // Setting min to 0 means no idle connections are pre-created. When a test file that does not use the database
    // reaches its afterAll teardown and we call db.destroy(), no real PostgreSQL connections are established — only
    // the tarn reaper is spun up and immediately torn down again.
    min: 0
  }
}

const production = {
  ...defaultConfig,
  migrations: {
    tableName: 'knex_migrations',
    directory: './db/migrations/public'
  },
  connection: defaultConnection
}

module.exports = { development, test, production }
