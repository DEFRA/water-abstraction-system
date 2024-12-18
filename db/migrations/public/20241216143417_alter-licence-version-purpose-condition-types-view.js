'use strict'

const viewName = 'licence_version_purpose_condition_types'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex(viewName)
        .withSchema('water')
        .select([
          'licence_version_purpose_condition_type_id AS id',
          'code',
          'subcode',
          'description',
          'subcode_description',
          'display_title',
          'param_1_label',
          'param_2_label',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex(viewName).withSchema('water').select([
        'licence_version_purpose_condition_type_id AS id',
        'code',
        'subcode',
        'description',
        'subcode_description',
        'display_title',
        // 'param_1_label', // remove param_1_label
        // 'param_2_label', // remove param_2_label
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}
