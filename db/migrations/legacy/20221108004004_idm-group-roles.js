'use strict'

const tableName = 'group_roles'

exports.up = function (knex) {
  return knex.schema.withSchema('idm').createTable(tableName, (table) => {
    // Primary Key
    table.string('group_role_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.string('group_id').notNullable()
    table.string('role_id').notNullable()

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['group_id', 'role_id'], { useConstraint: true })
  })
}

exports.down = function (knex) {
  return knex.schema.withSchema('idm').dropTableIfExists(tableName)
}
