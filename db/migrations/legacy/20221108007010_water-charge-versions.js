'use strict'

const tableName = 'charge_versions'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('charge_version_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('licence_ref').notNullable()
    table.string('scheme').notNullable()
    table.string('external_id').unique()
    table.integer('version_number').notNullable()
    table.date('start_date').notNullable()
    table.string('status').notNullable()
    table.boolean('apportionment')
    table.boolean('error').notNullable().defaultTo(false)
    table.date('end_date')
    table.date('billed_upto_date')
    table.integer('region_code').notNullable()
    table.string('source').notNullable()
    table.boolean('is_test').notNullable().defaultTo(false)
    table.uuid('company_id')
    table.uuid('invoice_account_id')
    table.uuid('change_reason_id')
    table.jsonb('created_by')
    table.jsonb('approved_by')
    table.uuid('licence_id').notNullable()
    table.uuid('note_id')

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
