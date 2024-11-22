'use strict'

const viewName = 'addresses'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex(viewName).withSchema('crm_v2').select([
        'addresses.address_id AS id',
        'addresses.address_1',
        'addresses.address_2',
        'addresses.address_3',
        'addresses.address_4',
        'addresses.town AS address_5',
        'addresses.county AS address_6',
        'addresses.postcode',
        'addresses.country',
        'addresses.external_id', // is populated for addresses migrated from NALD and is used for import conflicts
        // 'addresses.is_test', // we ignore this legacy test column in tables
        'addresses.data_source',
        'addresses.uprn',
        // 'addresses.last_hash', // is populated but is only used by the legacy import process
        // 'addresses.current_hash', // is populated but is only used by the legacy import process
        'addresses.date_created AS created_at',
        'addresses.date_updated AS updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropView(viewName).createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex(viewName).withSchema('crm_v2').select([
        'addresses.address_id AS id',
        'addresses.address_1',
        'addresses.address_2',
        'addresses.address_3',
        'addresses.address_4',
        'addresses.town AS address_5',
        'addresses.county AS address_6',
        'addresses.postcode',
        'addresses.country',
        // 'addresses.external_id', // is populated for addresses migrated from NALD and is used for import conflicts
        // 'addresses.is_test', // we ignore this legacy test column in tables
        'addresses.data_source',
        'addresses.uprn',
        // 'addresses.last_hash', // is populated but is only used by the legacy import process
        // 'addresses.current_hash', // is populated but is only used by the legacy import process
        'addresses.date_created AS created_at',
        'addresses.date_updated AS updated_at'
      ])
    )
  })
}
