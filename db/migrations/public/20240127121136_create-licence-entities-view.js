const viewName = 'licence_entities'

export function up(knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('entity').withSchema('crm').select([
        'entity_id AS id',
        'entity_nm AS name',
        'entity_type AS type',
        // 'entity_definition',
        // 'source',
        'created_at',
        'updated_at'
      ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName)
}
