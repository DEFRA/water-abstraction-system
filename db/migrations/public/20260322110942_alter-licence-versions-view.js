const viewName = 'licence_versions'

export function up(knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('licence_versions').withSchema('water').select([
        'licence_version_id AS id',
        'licence_id',
        'application_number',
        'issue',
        'increment',
        'status',
        'start_date',
        'end_date',
        'issue_date',
        'external_id',
        // 'is_test',
        'company_id', // New column added
        'address_id', // New column added
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('licence_versions').withSchema('water').select([
        'licence_version_id AS id',
        'licence_id',
        'application_number', // New column added
        'issue',
        'increment',
        'status',
        'start_date',
        'end_date',
        'issue_date', // New column added
        'external_id',
        // 'is_test',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}
