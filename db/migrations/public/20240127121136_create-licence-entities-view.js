'use strict'

const viewName = 'licence_entities'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('entity').withSchema('crm').select([
        'entity_id AS id',
        'entity_nm AS name',
        'entity_type AS type',
        // 'entity_definition',
        // 'source',
        'created_at',
        'updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
