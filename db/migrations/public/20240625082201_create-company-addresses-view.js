'use strict'

const viewName = 'company_addresses'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('company_addresses').withSchema('crm_v2').select([
        'company_address_id AS id',
        'company_id',
        'address_id',
        'role_id AS licence_role_id',
        'is_default AS default',
        'start_date',
        'end_date',
        // is_test
        'date_created AS created_at',
        'date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
