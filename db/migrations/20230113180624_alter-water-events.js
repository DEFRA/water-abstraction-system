'use strict'

const tableName = 'events'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .alterTable(tableName, (table) => {
      table.jsonb('licences')
      // Legacy timestamps
      table.timestamp('created', { precision: 0, useTz: false }).alter()
      table.timestamp('modified', { precision: 0, useTz: false }).alter()
    })
    .then(() => {
      knex.raw(`
        DROP TRIGGER IF EXISTS update_timestamp
        ON water.${tableName};
      `)
    })
}

exports.down = function (knex) {
  return knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON water.${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
    `)
    .then(() => {
      knex
        .schema
        .withSchema('water')
        .alterTable(tableName, (table) => {
          table.dropColumns('licences')
          // Legacy timestamps
          table.timestamp('created', { precision: 0, useTz: false }).alter().notNullable().defaultTo(knex.fn.now())
          table.timestamp('modified', { precision: 0, useTz: false }).alter().notNullable().defaultTo(knex.fn.now())
        })
    })
}
