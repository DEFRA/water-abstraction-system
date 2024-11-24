'use strict'

const viewName = 'charge_categories'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('billing_charge_categories')
        .withSchema('water')
        .select([
          'billing_charge_category_id AS id',
          'reference',
          'subsistence_charge',
          'description',
          'short_description',
          'is_tidal AS tidal',
          'loss_factor',
          'model_tier',
          'is_restricted_source AS restricted_source',
          'min_volume',
          'max_volume',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
