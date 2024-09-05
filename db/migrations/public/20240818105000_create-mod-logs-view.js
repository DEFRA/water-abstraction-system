'use strict'

const viewName = 'mod_logs'

exports.up = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
    .createView(viewName, (view) => {
      view.as(knex('mod_logs').withSchema('water').select([
        'id',
        'external_id',
        'event_code',
        'event_description',
        'reason_type',
        'reason_code',
        'reason_description',
        'nald_date',
        'user_id',
        'note',
        'licence_ref',
        'licence_external_id',
        'licence_id',
        'licence_version_external_id',
        'licence_version_id',
        'charge_version_external_id',
        'charge_version_id',
        'return_version_external_id',
        'return_version_id',
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
