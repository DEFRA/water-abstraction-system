'use strict'

const tableName = 'billing_batch_charge_version_years'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('billing_batch_charge_version_year_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('billing_batch_id').notNullable()
    table.uuid('charge_version_id').notNullable()
    table.integer('financial_year_ending').notNullable()
    table.string('status').notNullable()
    table.string('transaction_type').notNullable()
    table.boolean('is_summer').notNullable()
    table.boolean('has_two_part_agreement').defaultTo(false)
    table.boolean('is_chargeable').defaultTo(true)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['billing_batch_id', 'charge_version_id', 'financial_year_ending', 'transaction_type', 'is_summer'], {
      useConstraint: true
    })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
