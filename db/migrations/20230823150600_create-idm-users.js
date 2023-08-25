'use strict'

const tableName = 'users'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('idm')
    .createTable(tableName, (table) => {
      // Primary Key
      table.integer('user_id').primary().notNullable()

      // Data
      table.string('user_name').notNullable()
      table.string('password').notNullable()
      table.jsonb('user_data')
      table.string('reset_guid')
      table.bigint('reset_required')

      table.timestamp('last_login')
      table.bigint('bad_logins')
      table.string('application')
      table.jsonb('role')
      table.string('external_id')
      table.timestamp('reset_guid_date_created')
      table.boolean('enabled').notNullable().defaultTo(true)

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('idm')
    .dropTableIfExists(tableName)
}
