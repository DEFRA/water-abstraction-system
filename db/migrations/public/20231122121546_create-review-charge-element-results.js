'use strict'

const tableName = 'review_charge_element_results'

exports.up = function (knex) {
  return knex.schema
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('charge_element_id').notNullable()
      // Specifying `null, null` creates a decimal column that can store numbers of any precision and scale
      table.decimal('allocated', null, null).defaultTo(0)
      table.decimal('aggregate', null, null).defaultTo(1)
      table.boolean('charge_dates_overlap').defaultTo(false)

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
