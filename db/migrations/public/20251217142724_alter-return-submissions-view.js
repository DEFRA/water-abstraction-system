const viewName = 'return_submissions'

export function up(knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('versions').withSchema('returns').select([
        'version_id AS id',
        'return_log_id', // new column
        'return_id', // previously aliased as return_log_id
        'user_id',
        'user_type',
        'version_number as version',
        'metadata',
        'nil_return',
        'current',
        'notes',
        'created_by',
        'created_at',
        'updated_at'
      ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('versions')
        .withSchema('returns')
        .select([
          'version_id AS id',
          'return_id as return_log_id',
          'user_id',
          'user_type',
          'version_number as version',
          'metadata',
          'nil_return',
          'current',
          'notes',
          'created_by',
          'created_at',
          'updated_at'
        ])
    )
  })
}
