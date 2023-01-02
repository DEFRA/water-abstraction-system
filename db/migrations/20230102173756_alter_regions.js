'use strict'

const tableName = 'regions'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.string('name')
      table.string('display_name')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.dropColumns('name', 'display_name')
    })
}
