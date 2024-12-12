'use strict'

const viewName = 'sources'

exports.up = function (knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('sources')
        .withSchema('water')
        .select(['id', 'description', 'source_type', 'ngr', 'external_id', 'legacy_id', 'created_at', 'updated_at'])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
