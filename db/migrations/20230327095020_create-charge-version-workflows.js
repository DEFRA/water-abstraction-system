'use strict'

const tableName = 'charge_version_workflows'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('charge_version_workflow_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('licence_id').notNullable()
      table.jsonb('created_by')
      table.string('approver_comments')
      table.string('status')
      table.jsonb('data')
      table.uuid('licence_version_id')
      table.timestamp('date_deleted', { useTz: false })

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable()
      table.timestamp('date_updated', { useTz: false })
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
