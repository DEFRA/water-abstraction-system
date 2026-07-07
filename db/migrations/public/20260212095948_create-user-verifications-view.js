const viewName = 'user_verifications'

export function up(knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('verification')
        .withSchema('crm')
        .select([
          'verification_id AS id',
          'entity_id AS licence_entity_id',
          'company_entity_id',
          'verification_code',
          'method AS verification_method',
          'date_verified AS verified_at',
          'date_created AS created_at'
        ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName)
}
