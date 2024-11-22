'use strict'

const viewName = 'return_versions'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('return_versions')
        .withSchema('water')
        .select([
          'return_version_id AS id',
          'licence_id',
          'version_number AS version',
          'start_date',
          'end_date',
          'status',
          'external_id',
          'reason',
          'multiple_upload',
          'notes',
          'created_by',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
