'use strict'

const tableName = 'licence_end_date_changes'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('licence_id').notNullable()
    table.text('date_type').notNullable()
    table.date('change_date').notNullable()
    table.date('nald_date')
    table.date('wrls_date')

    // Timestamps
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['licence_id', 'date_type'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
