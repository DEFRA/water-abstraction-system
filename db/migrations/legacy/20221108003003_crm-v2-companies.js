'use strict'

const tableName = 'companies'

exports.up = function (knex) {
  return knex.schema.withSchema('crm_v2').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('company_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('name').notNullable()
    table.string('type')
    table.string('company_number').unique()
    table.string('external_id').unique()
    table.boolean('is_test').notNullable().defaultTo(false)
    table.string('organisation_type')
    table.string('last_hash')
    table.uuid('current_hash')

    // Legacy timestamps
    table.timestamp('date_created').notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm_v2').dropTableIfExists(tableName)
}
