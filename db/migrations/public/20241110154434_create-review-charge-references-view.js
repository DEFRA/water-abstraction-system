'use strict'

const viewName = 'review_charge_references'

exports.up = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
    .createView(viewName, (view) => {
      view.as(knex('review_charge_references').withSchema('water').select([
        'id',
        'review_charge_version_id',
        'charge_reference_id',
        'aggregate',
        'amended_aggregate',
        'charge_adjustment',
        'amended_charge_adjustment',
        'abatement_agreement',
        'winter_discount',
        'two_part_tariff_agreement',
        'canal_and_river_trust_agreement',
        'authorised_volume',
        'amended_authorised_volume',
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
