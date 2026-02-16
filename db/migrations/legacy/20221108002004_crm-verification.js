'use strict'

const tableName = 'verification'

exports.up = function (knex) {
  return knex.schema.withSchema('crm').createTable(tableName, (table) => {
    // Primary Key
    table.string('verification_id').primary()

    // Data
    table.string('entity_id').notNullable()
    table.string('company_entity_id').notNullable()
    table.string('verification_code').notNullable()
    table.timestamp('date_verified')
    table.timestamp('date_created').notNullable()
    table.string('method').notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm').dropTableIfExists(tableName).drop
}
