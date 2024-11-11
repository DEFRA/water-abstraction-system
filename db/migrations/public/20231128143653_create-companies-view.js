'use strict'

const viewName = 'companies'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('companies').withSchema('crm_v2').select([
        'companies.company_id AS id',
        'companies.name',
        'companies.type',
        'companies.company_number',
        // 'companies.external_id', // is populated for companies migrated from NALD but not actually used
        // 'companies.is_test', // we ignore this legacy test column in tables
        'companies.organisation_type',
        // 'companies.last_hash', // is populated but is only used by the legacy import process
        // 'companies.current_hash', // is populated but is only used by the legacy import process
        'companies.date_created AS created_at',
        'companies.date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
