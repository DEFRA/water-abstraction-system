'use strict'

const tableName = 'charge_versions'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('charge_version_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('licence_ref')
      table.string('scheme')

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
