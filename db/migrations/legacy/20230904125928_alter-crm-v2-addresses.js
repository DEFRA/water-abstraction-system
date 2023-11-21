'use strict'

const tableName = 'addresses'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .alterTable(tableName, (table) => {
      table.unique('uprn', { useConstraint: true })
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .alterTable(tableName, (table) => {
      table.dropUnique('uprn')
    })
}
