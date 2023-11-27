'use strict'

const viewName = 'return_submission_lines'

exports.up = function (knex) {
  return knex
    .schema
    .createView(viewName, (view) => {
      // NOTE: We have commented out unused columns from the source table
      view.as(knex('lines').withSchema('returns').select([
        'lines.line_id AS id',
        'lines.version_id AS return_submission_id',
        // 'lines.substance',
        'lines.quantity',
        // 'lines.unit',
        'lines.start_date',
        'lines.end_date',
        'lines.time_period',
        // 'lines.metadata',
        'lines.reading_type',
        'lines.user_unit',
        'lines.created_at',
        'lines.updated_at'
      ]))
    })
}

exports.down = function (knex) {
  return knex
    .schema
    .dropViewIfExists(viewName)
}
