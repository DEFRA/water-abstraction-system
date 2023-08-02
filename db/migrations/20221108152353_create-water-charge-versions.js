'use strict'

const tableName = 'charge_versions'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('charge_version_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('licence_ref')
      table.string('scheme')
      table.uuid('licence_id')
      table.date('start_date')
      table.date('end_date')

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
