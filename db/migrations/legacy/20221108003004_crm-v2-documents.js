'use strict'

const tableName = 'documents'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('document_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('regime').notNullable().defaultTo('water')
      table.string('document_type').notNullable().defaultTo('abstraction_licence')
      table.string('document_ref').notNullable()
      table.date('start_date').notNullable()
      table.date('end_date')
      table.string('external_id')
      table.boolean('is_test').notNullable().defaultTo(false)
      table.timestamp('date_deleted')

      // Legacy timestamps
      table.timestamp('date_created').notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated').notNullable().defaultTo(knex.fn.now())

      // Constraints
      table.unique(['document_ref'])
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .dropTableIfExists(tableName)
}
