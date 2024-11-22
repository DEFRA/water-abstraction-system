'use strict'

const tableName = 'roles'

exports.up = function (knex) {
  return knex.schema.withSchema('idm').createTable(tableName, (table) => {
    // Primary Key
    table.string('role_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('application')
    table.string('role').notNullable()
    table.string('description').notNullable()

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['application', 'role'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('idm').dropTableIfExists(tableName)
}
