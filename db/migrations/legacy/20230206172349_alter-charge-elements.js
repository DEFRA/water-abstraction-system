'use strict'

const tableName = 'charge_elements'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.smallint('abstraction_period_start_day')
      table.smallint('abstraction_period_start_month')
      table.smallint('abstraction_period_end_day')
      table.smallint('abstraction_period_end_month')
    })
}

exports.down = async function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.dropColumns(
        'abstraction_period_start_day',
        'abstraction_period_start_month',
        'abstraction_period_end_day',
        'abstraction_period_end_month'
      )
    })
}
