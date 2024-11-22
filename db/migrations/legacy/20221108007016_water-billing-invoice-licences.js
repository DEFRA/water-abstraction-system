'use strict'

const tableName = 'billing_invoice_licences'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('billing_invoice_licence_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('billing_invoice_id').notNullable()
    table.string('licence_ref').notNullable()
    table.uuid('licence_id').notNullable()

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['billing_invoice_id', 'licence_id'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
