'use strict'

const tableName = 'companies'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .alterTable(tableName, (table) => {
      table.unique('company_number', { useConstraint: true })
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('crm_v2')
    .alterTable(tableName, (table) => {
      table.dropUnique('company_number')
    })
}
