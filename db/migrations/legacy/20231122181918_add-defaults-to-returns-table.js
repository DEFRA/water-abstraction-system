'use strict'

const tableName = 'returns'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('returns')
    .alterTable(tableName, (table) => {
      table.string('regime').notNullable().defaultTo('water').alter()
      table.string('licence_type').notNullable().defaultTo('abstraction').alter()
    })
}

exports.down = async function (knex) {
  return knex
    .schema
    .withSchema('returns')
    .alterTable(tableName, (table) => {
      table.string('regime').notNullable().alter()
      table.string('licence_type').notNullable().alter()
    })
}
