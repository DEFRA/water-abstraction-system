'use strict'

const tableName = 'licence_version_purpose_points'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('licence_version_purpose_id').notNullable()
      table.text('description')
      table.text('ngr_1')
      table.text('ngr_2')
      table.text('ngr_3')
      table.text('ngr_4')
      table.text('external_id')
      table.integer('nald_point_id')
      table.uuid('point_id')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

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
