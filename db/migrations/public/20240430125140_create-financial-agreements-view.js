const viewName = 'financial_agreements'

export function up(knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('financial_agreement_types').withSchema('water').select([
        'financial_agreement_type_id AS id',
        'financial_agreement_code AS code',
        'description',
        'disabled',
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
