'use strict'

const tableName = 'purposes_primary'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('purpose_primary_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('legacy_id').notNullable()
    table.string('description').notNullable()
    table.boolean('is_test')

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['legacy_id'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
