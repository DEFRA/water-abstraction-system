'use strict'

const tableName = 'regions'

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('region_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('charge_region_id')
      table.integer('nald_region_id')
      table.string('name')
      table.string('display_name')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
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
