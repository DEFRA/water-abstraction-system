'use strict'

const tableName = 'review_licences'

exports.up = function (knex) {
  return knex
    .schema
    .alterTable(tableName, (table) => {
      table.boolean('mark_progress').notNullable().defaultTo(false)
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .alterTable(tableName, (table) => {
      table.dropColumn('mark_progress')
    })
}
