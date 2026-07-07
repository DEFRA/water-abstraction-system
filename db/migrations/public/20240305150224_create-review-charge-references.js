const tableName = 'review_charge_references'

export function up(knex) {
  return knex.schema
    .createTable(tableName, (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))

      // Data
      table.uuid('review_charge_version_id').notNullable()
      table.uuid('charge_reference_id')
      table.decimal('aggregate', null, null).defaultTo(1)

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
