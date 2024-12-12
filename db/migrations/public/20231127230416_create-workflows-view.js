'use strict'

const viewName = 'workflows'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('charge_version_workflows')
        .withSchema('water')
        .select([
          'charge_version_workflow_id AS id',
          'licence_id',
          'created_by',
          'approver_comments',
          'status',
          'data',
          'licence_version_id',
          'date_deleted AS deleted_at',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
