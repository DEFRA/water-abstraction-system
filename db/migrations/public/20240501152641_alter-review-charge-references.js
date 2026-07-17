const tableName = 'review_charge_references'

export function up(knex) {
  return knex.schema.alterTable(tableName, (table) => {
    table.decimal('authorised_volume', null, null).defaultTo(0)
    table.decimal('amended_authorised_volume', null, null).defaultTo(0)
  })
}

export function down(knex) {
  return knex.schema.alterTable(tableName, (table) => {
    table.dropColumn('authorised_volume')
    table.dropColumn('amended_authorised_volume')
  })
}
