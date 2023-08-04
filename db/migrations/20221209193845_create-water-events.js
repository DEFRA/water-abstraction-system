'use strict'

const tableName = 'events'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('event_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('type')
      table.string('subtype')
      table.string('issuer')
      table.jsonb('metadata')
      table.string('status')

      // Legacy timestamps
      table.timestamp('created', { precision: 0, useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('modified', { precision: 0, useTz: false }).notNullable().defaultTo(knex.fn.now())
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON water.${tableName}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
