'use strict'

const viewName = 'return_submission_lines'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('lines').withSchema('returns').select([
        'line_id AS id',
        'version_id AS return_submission_id',
        // 'substance', // always 'water'
        'quantity',
        // 'unit', // always 'm³'
        'start_date',
        'end_date',
        'time_period',
        // 'metadata',
        'reading_type',
        'user_unit',
        'created_at',
        'updated_at'
      ])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
