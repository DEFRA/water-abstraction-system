const viewName = 'events'

export function up(knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('events').withSchema('water').select([
        'event_id AS id',
        'reference_code',
        'type',
        'subtype',
        'issuer',
        'licences',
        'entities',
        // 'comment',
        'metadata',
        'status',
        'created AS created_at',
        'modified AS updated_at'
      ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName)
}
