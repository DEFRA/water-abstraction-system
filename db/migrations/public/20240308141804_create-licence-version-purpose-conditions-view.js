'use strict'

const viewName = 'licence_version_purpose_conditions'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('licence_version_purpose_conditions')
        .withSchema('water')
        .select([
          'licence_version_purpose_condition_id AS id',
          'licence_version_purpose_id',
          'licence_version_purpose_condition_type_id',
          'param_1',
          'param_2',
          'notes',
          'external_id',
          'source',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
