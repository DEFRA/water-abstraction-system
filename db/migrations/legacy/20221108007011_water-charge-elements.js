'use strict'

const tableName = 'charge_elements'

exports.up = function (knex) {
  return (
    // If it was a simple check constraint we could have used https://knexjs.org/guide/schema-builder.html#checks
    // But because of the complexity of the constraint we have had to drop to using raw() to add the constraint after
    // Knex has created the table.
    knex.schema.withSchema('water').createTable(tableName, (table) => {
      // Primary Key
      table.uuid('charge_element_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('charge_version_id').notNullable()
      table.string('external_id').unique()
      table.smallint('abstraction_period_start_day')
      table.smallint('abstraction_period_start_month')
      table.smallint('abstraction_period_end_day')
      table.smallint('abstraction_period_end_month')
      table.decimal('authorised_annual_quantity')
      table.string('season')
      table.string('season_derived')
      table.string('source').notNullable()
      table.string('loss').notNullable()
      table.boolean('factors_overridden')
      table.decimal('billable_annual_quantity')
      table.date('time_limited_start_date')
      table.date('time_limited_end_date')
      table.string('description')
      table.boolean('is_test').notNullable().defaultTo(false)
      table.uuid('purpose_primary_id')
      table.uuid('purpose_secondary_id')
      table.uuid('purpose_use_id')
      table.boolean('is_section_127_agreement_enabled').notNullable().defaultTo(true)
      table.string('scheme').notNullable().defaultTo('alcs')
      table.boolean('is_restricted_source').defaultTo(false)
      table.string('water_model')
      // Specifying a precision and scale of null means the value can be of any size
      table.decimal('volume', null, null)
      table.uuid('billing_charge_category_id')
      table.jsonb('additional_charges')
      table.jsonb('adjustments')
      table.boolean('is_section_126_agreement_enabled').defaultTo(false)
      table.boolean('is_section_130_agreement_enabled').defaultTo(false)
      table.string('eiuc_region')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    }).raw(`
      ALTER TABLE water.charge_elements
      ADD CONSTRAINT volume_authorised_annual_quantity
      CHECK (
        ((volume IS NOT NULL) OR (authorised_annual_quantity IS NOT NULL))
      );
    `)
  )
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
