const viewName = 'purposes'

export function up(knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('purposes_uses').withSchema('water').select([
        'purpose_use_id AS id',
        'legacy_id',
        'description',
        'loss_factor',
        'is_two_part_tariff AS two_part_tariff',
        // 'is_test',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName)
}
