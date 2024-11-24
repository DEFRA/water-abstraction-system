'use strict'

const tableName = 'returns'

exports.up = function (knex) {
  return knex.schema.withSchema('returns').createTable(tableName, (table) => {
    // Primary Key
    table.string('return_id').primary()

    // Data
    table.string('regime').notNullable().defaultTo('water')
    table.string('licence_type').notNullable().defaultTo('abstraction')
    table.string('licence_ref').notNullable()
    table.date('start_date').notNullable()
    table.date('end_date').notNullable()
    table.string('returns_frequency').notNullable()
    table.string('status').notNullable()
    table.string('source')
    table.jsonb('metadata')
    table.date('received_date')
    table.string('return_requirement').notNullable()
    table.date('due_date').notNullable()
    table.boolean('under_query').notNullable().defaultTo(false)
    table.string('under_query_comment')
    table.boolean('is_test').notNullable().defaultTo(false)
    table.uuid('return_cycle_id')

    // Legacy timestamps
    // NOTE: They are not automatically set
    table.timestamp('created_at').notNullable()
    table.timestamp('updated_at')

    // Constraints
    table.unique(['regime', 'licence_type', 'licence_ref', 'start_date', 'end_date', 'return_requirement'], {
      useConstraint: true
    })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('returns').dropTableIfExists(tableName)
}
