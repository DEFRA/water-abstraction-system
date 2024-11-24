'use strict'

const tableName = 'roles'

exports.up = function (knex) {
  return knex.schema.withSchema('crm_v2').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('role_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('name').notNullable()
    table.string('label')

    // Legacy timestamps
    table.timestamp('date_created').notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm_v2').dropTableIfExists(tableName)
}
