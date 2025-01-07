'use strict'

const viewName = 'licence_end_date_changes'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('licence_end_date_changes')
        .withSchema('water')
        .select(['id', 'licence_id', 'date_type', 'change_date', 'nald_date', 'wrls_date', 'created_at', 'updated_at'])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
