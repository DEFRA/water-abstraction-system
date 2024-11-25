'use strict'

const tableName = 'addresses'

exports.up = function (knex) {
  return knex.schema.withSchema('crm_v2').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('address_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('address_1')
    table.string('address_2')
    table.string('address_3')
    table.string('address_4')
    table.string('town')
    table.string('county')
    table.string('postcode')
    table.string('country')
    table.string('external_id').unique()
    table.boolean('is_test').notNullable().defaultTo(false)
    table.string('data_source').notNullable()
    table.integer('uprn').unique()
    table.string('last_hash')
    table.string('current_hash')

    // Legacy timestamps
    table.timestamp('date_created').notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm_v2').dropTableIfExists(tableName)
}
