'use strict'

const viewName = 'return_requirement_purposes'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('return_requirement_purposes')
        .withSchema('water')
        .select([
          'return_requirement_purpose_id AS id',
          'return_requirement_id',
          'purpose_primary_id AS primary_purpose_id',
          'purpose_secondary_id AS secondary_purpose_id',
          'purpose_use_id AS purpose_id',
          'purpose_alias AS alias',
          'external_id',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
