'use strict'

const viewName = 'licence_version_holders'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('licence_version_holders')
        .withSchema('water')
        .select([
          'id',
          'licence_version_id',
          'holder_type',
          'salutation',
          'initials',
          'forename',
          'name',
          'address_line_1',
          'address_line_2',
          'address_line_3',
          'address_line_4',
          'town',
          'county',
          'country',
          'postcode',
          'reference',
          'description',
          'local_name',
          'last_changed',
          'disabled',
          'created_at',
          'updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
