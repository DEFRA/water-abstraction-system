const tableName = 'review_licences'

export function up(knex) {
  return knex.schema.alterTable(tableName, (table) => {
    table.boolean('progress').notNullable().defaultTo(false)
  })
}

export function down(knex) {
  return knex.schema.alterTable(tableName, (table) => {
    table.dropColumn('progress')
  })
}
