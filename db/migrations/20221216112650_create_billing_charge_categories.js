'use strict'

const tableName = 'billing_charge_categories'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('billing_charge_category_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.string('reference')
      table.integer('subsistence_charge')
      table.string('description')
      table.string('short_description')
      table.boolean('is_tidal')
      table.string('loss_factor')
      table.string('model_tier')
      table.boolean('is_restricted_source')
      table.bigInteger('min_volume')
      table.bigInteger('max_volume')

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
