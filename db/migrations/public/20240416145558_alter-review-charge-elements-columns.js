const tableName = 'review_charge_elements'

export async function up(knex) {
  return knex.schema.alterTable(tableName, (table) => {
    table.decimal('calculated')
  })
}

export async function down(knex) {
  return knex.schema.alterTable(tableName, (table) => {
    table.dropColumn('calculated')
  })
}
