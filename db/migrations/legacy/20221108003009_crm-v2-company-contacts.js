'use strict'

const tableName = 'company_contacts'

exports.up = function (knex) {
  return knex.schema.withSchema('crm_v2').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('company_contact_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('company_id').notNullable()
    table.uuid('contact_id').notNullable()
    table.uuid('role_id').notNullable()
    table.boolean('is_default').notNullable().defaultTo(false)
    table.string('email_address')
    table.date('start_date').notNullable()
    table.date('end_date')
    table.boolean('is_test').notNullable().defaultTo(false)
    table.boolean('water_abstraction_alerts_enabled').defaultTo(false)

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['company_id', 'contact_id', 'role_id', 'start_date'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('crm_v2').dropTableIfExists(tableName)
}
