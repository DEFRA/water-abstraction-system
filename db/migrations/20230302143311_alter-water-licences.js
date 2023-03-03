'use strict'

const tableName = 'licences'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.boolean('is_water_undertaker')
      table.jsonb('regions')
      table.date('start_date')
      table.date('expired_date')
      table.date('lapsed_date')
      table.date('revoked_date')
      table.boolean('suspend_from_billing')
    })
}

exports.down = async function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.dropColumns(
        'is_water_undertaker',
        'regions',
        'start_date',
        'expired_date',
        'lapsed_date',
        'revoked_date',
        'suspend_from_billing'
      )
    })
}
