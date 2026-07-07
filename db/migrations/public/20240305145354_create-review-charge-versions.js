const tableName = 'review_charge_versions'

export function up(knex) {
  return knex.schema
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('review_licence_id').notNullable()
      table.uuid('charge_version_id').notNullable()
      table.string('change_reason').notNullable()
      table.date('charge_period_start_date').notNullable()
      table.date('charge_period_end_date').notNullable()

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

export function down(knex) {
  return knex.schema.dropTableIfExists(tableName)
}
