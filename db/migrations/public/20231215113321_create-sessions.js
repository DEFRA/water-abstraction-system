'use strict'

const tableName = 'sessions'

exports.up = function (knex) {
  return knex
    .schema
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      // Data
      table.jsonb('data').defaultTo({})

      // Automatic timestamps
      table.timestamps(false, true)
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON ${tableName}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
        `)
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropTableIfExists(tableName)
}
