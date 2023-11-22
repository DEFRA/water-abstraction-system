'use strict'

const tableName = 'lines'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('returns')
    .alterTable(tableName, (table) => {
      table.string('substance').notNullable().defaultTo('water').alter()
      table.string('unit').notNullable().defaultTo('m³').alter()
    })
}

exports.down = async function (knex) {
  return knex
    .schema
    .withSchema('returns')
    .alterTable(tableName, (table) => {
      table.string('substance').notNullable().alter()
      table.string('unit').notNullable().alter()
    })
}
