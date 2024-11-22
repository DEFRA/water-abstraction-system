'use strict'

const viewName = 'licences'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('licences').withSchema('water').select([
        'licence_id AS id',
        'region_id',
        'licence_ref',
        'is_water_undertaker AS water_undertaker',
        'regions',
        'start_date',
        'expired_date',
        'lapsed_date',
        'revoked_date',
        'suspend_from_billing',
        // 'is_test',
        'include_in_supplementary_billing AS include_in_presroc_billing',
        'include_in_sroc_supplementary_billing AS include_in_sroc_billing',
        // 'include_in_sroc_tpt_supplementary_billing AS include_in_sroc_tpt_billing',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('licences').withSchema('water').select([
        'licence_id AS id',
        'region_id',
        'licence_ref',
        'is_water_undertaker AS water_undertaker',
        'regions',
        'start_date',
        'expired_date',
        'lapsed_date',
        'revoked_date',
        'suspend_from_billing',
        // 'is_test',
        'include_in_supplementary_billing AS include_in_presroc_billing',
        'include_in_sroc_supplementary_billing AS include_in_sroc_billing',
        'include_in_sroc_tpt_supplementary_billing AS include_in_sroc_tpt_billing',
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}
