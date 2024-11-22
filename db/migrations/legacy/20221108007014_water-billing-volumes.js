'use strict'

const tableName = 'billing_volumes'

exports.up = function (knex) {
  return (
    // If it was a simple check constraint we could have used https://knexjs.org/guide/schema-builder.html#checks
    // But because of the complexity of the constraint we have had to drop to using raw() to add the constraint after
    // Knex has created the table.
    knex.schema.withSchema('water').createTable(tableName, (table) => {
      // Primary Key
      table.uuid('billing_volume_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('charge_element_id').notNullable()
      table.smallint('financial_year').notNullable()
      table.boolean('is_summer').notNullable()
      table.decimal('calculated_volume')
      table.boolean('two_part_tariff_error').notNullable().defaultTo(false)
      table.integer('two_part_tariff_status')
      table.jsonb('two_part_tariff_review')
      table.boolean('is_approved').notNullable().defaultTo(false)
      table.uuid('billing_batch_id').notNullable()
      // Specify the precision and scale
      table.decimal('volume', 20, 6).defaultTo(0)
      table.timestamp('errored_on')
    }).raw(`
      CREATE UNIQUE INDEX uniq_charge_element_id_financial_year_season_err
      ON water.billing_volumes USING btree (
        charge_element_id,
        financial_year,
        is_summer,
        billing_batch_id
      )
      WHERE (errored_on IS NULL);
    `)
  )
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
