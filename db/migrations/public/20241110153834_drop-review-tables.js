'use strict'

exports.up = async function (knex) {
  await knex.schema.withSchema('public').dropTableIfExists('review_returns')

  await knex.schema.withSchema('public').dropTableIfExists('review_licences')

  await knex.schema.withSchema('public').dropTableIfExists('review_charge_versions')

  await knex.schema.withSchema('public').dropTableIfExists('review_charge_references')

  await knex.schema.withSchema('public').dropTableIfExists('review_charge_elements_returns')

  await knex.schema.withSchema('public').dropTableIfExists('review_charge_elements')

  return knex.schema.withSchema('public').dropTableIfExists('licence_supplementary_years')
}

exports.down = async function (knex) {
  await knex.schema
    .withSchema('public')
    .createTable('review_returns', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('review_licence_id').notNullable()
      table.string('return_id').notNullable()
      table.string('return_reference')
      table.decimal('quantity', null, null).defaultTo(0)
      table.decimal('allocated', null, null).defaultTo(0)
      table.boolean('under_query').defaultTo(false)
      table.string('return_status')
      table.boolean('nil_return').defaultTo(false)
      table.boolean('abstraction_outside_period').defaultTo(false)
      table.date('received_date')
      table.date('due_date')
      table.jsonb('purposes')
      table.string('description')
      table.date('start_date')
      table.date('end_date')
      table.string('issues')
      table.timestamps(false, true)
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON review_returns
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })

  await knex.schema
    .withSchema('public')
    .createTable('review_licences', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('bill_run_id').notNullable()
      table.uuid('licence_id').notNullable()
      table.string('licence_ref').notNullable()
      table.string('licence_holder').notNullable()
      table.text('issues')
      table.string('status').notNullable()
      table.timestamps(false, true)
      table.boolean('progress').notNullable().defaultTo(false)
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON review_licences
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })

  await knex.schema
    .withSchema('public')
    .createTable('review_charge_versions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('review_licence_id').notNullable()
      table.uuid('charge_version_id').notNullable()
      table.string('change_reason').notNullable()
      table.date('charge_period_start_date').notNullable()
      table.date('charge_period_end_date').notNullable()
      table.timestamps(false, true)
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON review_charge_versions
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })

  await knex.schema
    .withSchema('public')
    .createTable('review_charge_references', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('review_charge_version_id').notNullable()
      table.uuid('charge_reference_id')
      table.decimal('aggregate', null, null).defaultTo(1)
      table.timestamps(false, true)
      table.decimal('amended_aggregate', null, null).defaultTo(1)
      table.decimal('charge_adjustment', null, null).defaultTo(1)
      table.decimal('amended_charge_adjustment', null, null).defaultTo(1)
      table.decimal('abatement_agreement', null, null).defaultTo(1)
      table.boolean('winter_discount')
      table.boolean('two_part_tariff_agreement')
      table.boolean('canal_and_river_trust_agreement')
      table.decimal('authorised_volume', null, null).defaultTo(0)
      table.decimal('amended_authorised_volume', null, null).defaultTo(0)
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON review_charge_references
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })

  await knex.schema
    .withSchema('public')
    .createTable('review_charge_elements_returns', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('review_charge_element_id').notNullable()
      table.uuid('review_return_id').notNullable()
      table.timestamps(false, true)
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON review_charge_elements_returns
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })

  await knex.schema
    .withSchema('public')
    .createTable('review_charge_elements', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('review_charge_reference_id').notNullable()
      table.uuid('charge_element_id').notNullable()
      table.decimal('allocated', null, null).defaultTo(0)
      table.boolean('charge_dates_overlap').defaultTo(false)
      table.text('issues')
      table.string('status').notNullable()
      table.timestamps(false, true)
      table.decimal('amended_allocated', null, null).defaultTo(0).alter()
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON review_charge_elements
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })

  return knex.schema
    .withSchema('public')
    .createTable('licence_supplementary_years', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('licence_id').notNullable()
      table.uuid('bill_run_id')
      table.integer('financial_year_end').notNullable()
      table.boolean('two_part_tariff')
      table.timestamps(false, true)
    })
    .then(() => {
      knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON licence_supplementary_years
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `)
    })
}
