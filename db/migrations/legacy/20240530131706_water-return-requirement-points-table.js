'use strict'

const tableName = 'return_requirement_points'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('return_requirement_id').notNullable()
      table.string('description').notNullable()
      table.string('ngr_1').notNullable()
      table.string('ngr_2')
      table.string('ngr_3')
      table.string('ngr_4')
      table.string('external_id')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
