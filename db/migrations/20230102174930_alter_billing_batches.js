'use strict'

const tableName = 'billing_batches'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.boolean('is_summer').notNullable().defaultTo(false)
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      table.dropColumns('is_summer')
    })
}
