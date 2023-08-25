'use strict'

const tableName = 'group_roles'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('idm')
    .createTable(tableName, (table) => {
      // Primary Key
      table.string('user_id').primary().notNullable()

      // Data
      table.string('group_id').notNullable()
      table.string('role_id').notNullable()

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
