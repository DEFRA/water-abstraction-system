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
