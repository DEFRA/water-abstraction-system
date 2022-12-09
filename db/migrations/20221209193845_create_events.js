'use strict'

const tableName = 'events'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('event_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('type')
      table.string('subtype')
      table.string('issuer')
      table.jsonb('licences')
      table.jsonb('metadata')
      table.string('status')

      // Automatic timestamps
      table.timestamps(false, true)
    })

  await knex.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON water.${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `)
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .dropTableIfExists(tableName)
}
