'use strict'

const tableName = 'billing_invoice_licences'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('billing_invoice_licence_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('billing_invoice_id')
      table.string('licence_ref')
      table.uuid('licence_id')

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
