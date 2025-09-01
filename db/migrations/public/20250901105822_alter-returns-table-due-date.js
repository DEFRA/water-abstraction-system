'use strict'

const viewName = 'return_logs'

exports.up = async function (knex) {
  await knex.schema.dropViewIfExists(viewName)

  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('returns').withSchema('returns').select([
        'return_id AS id',
        'id AS return_id',
        // 'regime', // always 'water'
        // 'licence_type', // always 'abstraction'
        'licence_ref',
        'start_date',
        'end_date',
        'returns_frequency',
        'status',
        'source',
        'metadata',
        'received_date',
        'return_requirement as return_reference',
        'due_date',
        'under_query',
        // 'under_query_comment',
        // 'is_test',
        'return_cycle_id',
        'created_at',
        'updated_at'
      ])
    )
  })
}

exports.down = async function (knex) {
  await knex.schema.dropViewIfExists(viewName)

  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('returns').withSchema('returns').select([
        'return_id AS id',
        'id AS return_id',
        // 'regime', // always 'water'
        // 'licence_type', // always 'abstraction'
        'licence_ref',
        'start_date',
        'end_date',
        'returns_frequency',
        'status',
        'source',
        'metadata',
        'received_date',
        'return_requirement as return_reference',
        'due_date',
        'under_query',
        // 'under_query_comment',
        // 'is_test',
        'return_cycle_id',
        'created_at',
        'updated_at'
      ])
    )
  })
}
