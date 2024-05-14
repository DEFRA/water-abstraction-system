'use strict'

const tableName = 'company_contacts'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('company_contact_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.boolean('is_default')
      table.boolean('is_test')
      table.boolean('water_abstraction_alerts_enabled')
      table.date('end_date')
      table.date('start_date')
      table.string('email_address')
      table.uuid('company_id')
      table.uuid('contact_id')
      table.uuid('role_id')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .dropTableIfExists(tableName)
}
