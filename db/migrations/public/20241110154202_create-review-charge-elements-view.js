'use strict'

const viewName = 'review_charge_elements'

exports.up = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
    .createView(viewName, (view) => {
      view.as(knex('review_charge_elements').withSchema('water').select([
        'id',
        'review_charge_reference_id',
        'charge_element_id',
        'allocated',
        'amended_allocated',
        'charge_dates_overlap',
        'issues',
        'status',
        'created_at',
        'updated_at'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
