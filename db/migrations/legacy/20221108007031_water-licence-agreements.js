'use strict'

const tableName = 'licence_agreements'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('licence_agreement_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('financial_agreement_type_id').notNullable()
    table.string('licence_ref').notNullable()
    table.date('start_date').notNullable()
    table.date('end_date')
    table.date('date_signed')
    table.date('date_deleted')
    table.string('source').notNullable().default('wrls')
    table.boolean('is_test').notNullable().default(false)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
