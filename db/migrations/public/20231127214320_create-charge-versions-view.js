'use strict'

const viewName = 'charge_versions'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex('charge_versions').withSchema('water').select([
        'charge_version_id AS id',
        'licence_ref',
        'scheme',
        // 'external_id', // is not populated for SROC
        'version_number',
        'start_date',
        'status',
        // 'apportionment', // is not populated for SROC
        'error',
        'end_date',
        'billed_upto_date',
        'region_code',
        // 'source',// is always 'wrls' for SROC //TODO: Is not nullable so needs a default of 'wrls'
        'company_id',
        'invoice_account_id',
        'change_reason_id',
        'created_by',
        'approved_by',
        'licence_id',
        'note_id',
        'is_test',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
