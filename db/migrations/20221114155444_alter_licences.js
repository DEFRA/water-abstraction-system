'use strict'

const tableName = 'licences'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.uuid('region_id')
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.dropColumns('region_id')
    })
}
