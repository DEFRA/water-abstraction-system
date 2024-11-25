'use strict'

const tableName = 'invoice_account_addresses'

exports.up = function (knex) {
  return knex.schema.withSchema('crm_v2').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('invoice_account_address_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('invoice_account_id').notNullable()
    table.uuid('address_id').notNullable()
    table.date('start_date').notNullable()
    table.date('end_date')
    table.boolean('is_test').notNullable().defaultTo(false)
    table.uuid('agent_company_id')
    table.uuid('contact_id')

    // Legacy timestamps
    table.timestamp('date_created').notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated').notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['invoice_account_id', 'start_date'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm_v2').dropTableIfExists(tableName)
}
