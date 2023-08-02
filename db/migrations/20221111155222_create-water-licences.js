'use strict'

const tableName = 'licences'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('licence_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('licence_ref')
      table.string('include_in_supplementary_billing')
      table.uuid('region_id')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
