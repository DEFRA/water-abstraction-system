'use strict'

const viewName = 'return_logs'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex('returns').withSchema('returns').select([
        'returns.return_id AS id',
        // 'returns.regime',
        // 'returns.licence_type',
        'returns.licence_ref',
        'returns.start_date',
        'returns.end_date',
        'returns.returns_frequency',
        'returns.status',
        // 'returns.source',
        'returns.metadata',
        'returns.received_date',
        'returns.return_requirement',
        'returns.due_date',
        'returns.under_query',
        // 'returns.under_query_comment',
        // 'returns.return_cycle_id' // is populated but links to a table that does not appear to be used
        'returns.is_test',
        'returns.created_at',
        'returns.updated_at'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
