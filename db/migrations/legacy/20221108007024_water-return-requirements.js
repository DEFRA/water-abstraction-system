'use strict'

const tableName = 'return_requirements'

exports.up = function (knex) {
  return knex.schema.withSchema('water').createTable(tableName, (table) => {
    // Primary Key
    table.uuid('return_requirement_id').primary().defaultTo(knex.raw('gen_random_uuid()'))

    // Data
    table.uuid('return_version_id').notNullable()
    table.string('returns_frequency').notNullable()
    table.boolean('is_summer').notNullable().defaultTo(false)
    table.boolean('is_upload').notNullable().defaultTo(false)
    table.smallint('abstraction_period_start_day')
    table.smallint('abstraction_period_start_month')
    table.smallint('abstraction_period_end_day')
    table.smallint('abstraction_period_end_month')
    table.string('site_description')
    table.string('description')
    table.integer('legacy_id')
    table.string('external_id')
    table.text('collection_frequency').notNullable().defaultTo('day')
    table.boolean('gravity_fill').notNullable().defaultTo(false)
    table.boolean('reabstraction').notNullable().defaultTo(false)
    table.boolean('two_part_tariff').notNullable().defaultTo(false)
    table.boolean('fifty_six_exception').notNullable().defaultTo(false)
    table.text('reporting_frequency').notNullable().defaultTo('day')
    table.integer('reference').notNullable()

    // Legacy timestamps
    table.timestamp('date_created', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('date_updated', { useTz: false }).notNullable().defaultTo(knex.fn.now())

    // Constraints
    table.unique(['external_id'], { useConstraint: true })
    table.unique(['reference'], { useConstraint: true })
  }).raw(`
    -- Sequence
    CREATE SEQUENCE water.return_reference_seq START WITH 10000000;

    ALTER TABLE water.return_requirements ALTER COLUMN reference SET DEFAULT nextval('water.return_reference_seq');
  `).raw(`
    CREATE OR REPLACE FUNCTION sync_legacy_id_to_reference()
    RETURNS TRIGGER AS $$
    BEGIN
      -- If legacy_id is NULL, set it to NEW.reference
      IF NEW.legacy_id IS NULL THEN
        NEW.legacy_id := NEW.reference;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_sync_legacy_id
    BEFORE INSERT ON water.return_requirements
    FOR EACH ROW
    EXECUTE FUNCTION sync_legacy_id_to_reference();
  `)
}

exports.down = function (knex) {
  return knex.schema.withSchema('water').dropTableIfExists(tableName)
}
