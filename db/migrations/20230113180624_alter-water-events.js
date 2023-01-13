'use strict'

const tableName = 'events'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      // Legacy timestamps
      table.timestamp('created', { precision: 0, useTz: false }).alter()
      table.timestamp('modified', { precision: 0, useTz: false }).alter()
    })

  await knex.raw(`
    DROP TRIGGER IF EXISTS update_timestamp
    ON water.${tableName};
  `)
}

exports.down = async function (knex) {
  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON water.${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `)

  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, table => {
      // Legacy timestamps
      table.timestamp('created', { precision: 0, useTz: false }).alter().notNullable().defaultTo(knex.fn.now())
      table.timestamp('modified', { precision: 0, useTz: false }).alter().notNullable().defaultTo(knex.fn.now())
    })
}
