'use strict'

const tableName = 'events'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('event_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('reference_code')
    table.string('type').notNullable()
    table.string('subtype')
    table.string('issuer')
    table.jsonb('licences')
    table.jsonb('entities')
    table.string('comment')
    table.jsonb('metadata')
    table.string('status')
    table.string('overall_status')
    table.jsonb('status_counts')

    // Legacy timestamps
    table.timestamp('created', { precision: 0, useTz: false })
    table.timestamp('modified', { precision: 0, useTz: false })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
