'use strict'

const tableName = 'lines'

exports.up = function (knex) {
  return knex.schema.withSchema('returns').createTable(tableName, (table) => {
    // Primary Key
    table.string('line_id').primary()

    // Data
    table.string('version_id').notNullable()
    table.string('substance').notNullable().defaultTo('water')
    table.decimal('quantity')
    table.string('unit').notNullable().defaultTo('m³')
    table.date('start_date').notNullable()
    table.date('end_date').notNullable()
    table.string('time_period').notNullable()
    table.jsonb('metadata')
    table.string('reading_type')
    table.string('user_unit')

    // Legacy timestamps
    // NOTE: They are not automatically set
    table.timestamp('created_at').notNullable()
    table.timestamp('updated_at')

    // Constraints
    table.unique(['version_id', 'substance', 'start_date', 'end_date'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('returns').dropTableIfExists(tableName)
}
