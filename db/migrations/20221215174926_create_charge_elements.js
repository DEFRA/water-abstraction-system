'use strict'

const tableName = 'charge_elements'

exports.up = async function (knex) {
  await knex
    .schema
    .withSchema('water')
    .createTable(tableName, table => {
      // Primary Key
      table.uuid('charge_element_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('charge_version_id')
      table.string('source')
      table.string('loss')
      table.string('description')
      table.boolean('is_section_127_agreement_enabled')
      table.string('scheme')
      table.boolean('is_restricted_source')
      table.string('water_model')
      table.decimal('volume')
      table.uuid('billing_charge_category_id')
      table.jsonb('additional_charges')
      table.jsonb('adjustments')
      table.string('eiuc_region')

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
