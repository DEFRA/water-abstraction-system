'use strict'

const viewName = 'review_licences'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('review_licences')
        .withSchema('water')
        .select([
          'id',
          'bill_run_id',
          'licence_id',
          'licence_ref',
          'licence_holder',
          'issues',
          'status',
          'progress',
          'created_at',
          'updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
