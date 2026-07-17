const tableName = 'versions'

export function up(knex) {
  return knex.schema.withSchema('returns').createTable(tableName, (table) => {
    // Primary Key
    table.string('version_id').primary()

    // Data
    table.uuid('return_log_id').notNullable()
    table.string('return_id').notNullable()
    table.string('user_id').notNullable()
    table.string('user_type').notNullable()
    table.integer('version_number').notNullable()
    table.jsonb('metadata').notNullable()
    table.boolean('nil_return').notNullable()
    table.boolean('current')
    table.text('notes')
    table.integer('created_by')

    // Legacy timestamps
    // NOTE: They are not automatically set
    table.timestamp('created_at').notNullable()
    table.timestamp('updated_at')

    // Constraints
    table.unique(['return_id', 'version_number'], { useConstraint: true })
  })
}

export function down(knex) {
  return knex.schema.withSchema('returns').dropTableIfExists(tableName)
}
