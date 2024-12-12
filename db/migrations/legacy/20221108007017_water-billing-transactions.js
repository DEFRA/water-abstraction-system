'use strict'

const tableName = 'billing_transactions'

exports.up = function (knex) {
  return (
    // If it was a simple check constraint we could have used https://knexjs.org/guide/schema-builder.html#checks
    // But because of the complexity of the constraint we have had to drop to using raw() to add the constraint after
    // Knex has created the table.
    knex.schema.withSchema('water').createTable(tableName, (table) => {
      // Primary Key
      table.uuid('billing_transaction_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('billing_invoice_licence_id').notNullable()
      table.uuid('charge_element_id')
      table.date('start_date')
      table.date('end_date')
      table.jsonb('abstraction_period')
      table.string('source')
      table.string('season')
      table.string('loss')
      table.decimal('net_amount')
      table.boolean('is_credit')
      table.string('charge_type')
      table.decimal('authorised_quantity')
      table.decimal('billable_quantity')
      table.smallint('authorised_days')
      table.smallint('billable_days')
      table.text('status')
      table.text('description').notNullable()
      table.uuid('external_id')
      table.decimal('volume')
      table.decimal('section_126_factor').defaultTo(1)
      table.boolean('section_127_agreement').notNullable().defaultTo(false)
      table.string('section_130_agreement')
      table.boolean('is_de_minimis').notNullable().defaultTo(false)
      table.boolean('is_new_licence').notNullable().defaultTo(false)
      table.string('legacy_id').unique()
      table.jsonb('metadata')
      table.uuid('source_transaction_id')
      table.decimal('calc_source_factor')
      table.decimal('calc_season_factor')
      table.decimal('calc_loss_factor')
      table.decimal('calc_suc_factor')
      table.decimal('calc_s_126_factor')
      table.decimal('calc_s_127_factor')
      table.decimal('calc_eiuc_factor')
      table.decimal('calc_eiuc_source_factor')
      table.boolean('is_credited_back').defaultTo(false)
      table.boolean('is_two_part_second_part_charge').notNullable().defaultTo(false)
      table.string('scheme').notNullable().defaultTo('alcs')
      table.decimal('aggregate_factor')
      table.decimal('adjustment_factor')
      table.text('charge_category_code')
      table.text('charge_category_description')
      table.boolean('is_supported_source').defaultTo(false)
      table.text('supported_source_name')
      table.boolean('is_water_company_charge').defaultTo(false)
      table.boolean('is_winter_only').defaultTo(false)
      table.boolean('is_water_undertaker').defaultTo(false)
      table.jsonb('purposes')
      table.jsonb('gross_values_calculated')
      table.decimal('winter_discount_factor')
      table.decimal('calc_adjustment_factor')
      table.decimal('calc_winter_discount_factor')
      table.decimal('calc_s_130_factor')

      // Legacy timestamps
      table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    }).raw(`
      ALTER TABLE water.billing_transactions
      ADD CONSTRAINT abstraction_period_check
      CHECK (
        ((charge_type = 'minimum_charge') OR (abstraction_period IS NOT NULL) OR (scheme = 'sroc'))
      );
    `).raw(`
      ALTER TABLE water.billing_transactions
      ADD CONSTRAINT charge_element_id_check
      CHECK (
        ((charge_type = 'minimum_charge') OR (charge_element_id IS NOT NULL))
      );
    `).raw(`
      ALTER TABLE water.billing_transactions
      ADD CONSTRAINT end_date_check
      CHECK (
        ((charge_type = 'minimum_charge') OR (end_date IS NOT NULL))
      );
    `).raw(`
      ALTER TABLE water.billing_transactions
      ADD CONSTRAINT loss_check
      CHECK (
        ((charge_type = 'minimum_charge') OR (loss IS NOT NULL))
      );
    `).raw(`
      ALTER TABLE water.billing_transactions
      ADD CONSTRAINT purposes_check
      CHECK (
        ((purposes IS NOT NULL) OR (scheme = 'alcs'))
      );
    `).raw(`
      ALTER TABLE water.billing_transactions
      ADD CONSTRAINT season_check
      CHECK (
        ((charge_type = 'minimum_charge') OR (season IS NOT NULL) OR (scheme = 'sroc'))
      );
    `).raw(`
      ALTER TABLE water.billing_transactions
      ADD CONSTRAINT source_check
      CHECK (
        ((charge_type = 'minimum_charge') OR (source IS NOT NULL))
      );
    `).raw(`
      ALTER TABLE water.billing_transactions
      ADD CONSTRAINT start_date_check
      CHECK (
        ((charge_type = 'minimum_charge') OR (start_date IS NOT NULL))
      );
    `).raw(`
      ALTER TABLE water.billing_transactions
      ADD CONSTRAINT volume_check
      CHECK (
        ((charge_type = 'minimum_charge') OR (volume IS NOT NULL))
      );
    `)
  )
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
