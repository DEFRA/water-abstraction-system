'use strict'

const tableName = 'mod_logs'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('external_id').notNullable()
      table.string('event_code').notNullable()
      table.string('event_description').notNullable()

      table.string('reason_type')
      table.string('reason_code')
      table.string('reason_description')

      table.date('nald_date').notNullable()
      table.string('user_id').notNullable()
      table.text('note')

      table.string('licence_ref').notNullable()
      table.string('licence_external_id').notNullable()
      table.uuid('licence_id')

      table.string('licence_version_external_id')
      table.uuid('licence_version_id')

      table.string('charge_version_external_id')
      table.uuid('charge_version_id')

      table.string('return_version_external_id')
      table.uuid('return_version_id')

      // Timestamps
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())

      // Constraints
      table.unique(['external_id'], { useConstraint: true })
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
