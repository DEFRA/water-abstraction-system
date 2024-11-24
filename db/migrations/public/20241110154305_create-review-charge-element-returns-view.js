'use strict'

const viewName = 'review_charge_element_returns'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('review_charge_element_returns')
        .withSchema('water')
        .select(['id', 'review_charge_element_id', 'review_return_id', 'created_at', 'updated_at'])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
