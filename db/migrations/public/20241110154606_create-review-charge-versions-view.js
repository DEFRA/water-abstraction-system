'use strict'

const viewName = 'review_charge_versions'

exports.up = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
    .createView(viewName, (view) => {
      view.as(knex('review_charge_versions').withSchema('water').select([
        'id',
        'review_licence_id',
        'charge_version_id',
        'change_reason',
        'charge_period_start_date',
        'charge_period_end_date',
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
