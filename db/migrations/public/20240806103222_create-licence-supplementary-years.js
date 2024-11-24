'use strict'

const tableName = 'licence_supplementary_years'

exports.up = function (knex) {
  return knex.schema
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('licence_id').notNullable()
      table.uuid('bill_run_id')
      table.integer('financial_year_end').notNullable()
      table.boolean('two_part_tariff')

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
  return knex.schema.dropTableIfExists(tableName)
}
