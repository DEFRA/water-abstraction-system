'use strict'

const tableName = 'returns.returns'
const viewName = 'return_logs'

exports.up = async function (knex) {
  await knex.schema.dropViewIfExists(viewName)
  await knex.schema.alterTable(tableName, (table) => {
    table.date('due_date').nullable().alter()
  })

  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('returns').withSchema('returns').select([
        'return_id AS id',
        // 'regime', // always 'water'
        // 'licence_type', // always 'abstraction'
        'licence_ref',
        'start_date',
        'end_date',
        'returns_frequency',
        'status',
        // 'source', // always 'NALD'
        'metadata',
        'received_date',
        'return_requirement',
        'due_date',
        'under_query',
        // 'under_query_comment',
        // 'is_test',
        // 'return_cycle_id' // is populated but links to a table that does not appear to be used
        'created_at',
        'updated_at'
      ])
    )
  })
}

exports.down = async function (knex) {
  await knex.schema.dropViewIfExists(viewName)
  await knex.schema.alterTable(tableName, (table) => {
    table.date('due_date').notNullable().alter()
  })

  return knex.schema.createView(viewName, (view) => {
    // NOTE: We have commented out unused columns from the source table
    view.as(
      knex('returns').withSchema('returns').select([
        'return_id AS id',
        // 'regime', // always 'water'
        // 'licence_type', // always 'abstraction'
        'licence_ref',
        'start_date',
        'end_date',
        'returns_frequency',
        'status',
        // 'source', // always 'NALD'
        'metadata',
        'received_date',
        'return_requirement',
        'due_date',
        'under_query',
        // 'under_query_comment',
        // 'is_test',
        // 'return_cycle_id' // is populated but links to a table that does not appear to be used
        'created_at',
        'updated_at'
      ])
    )
  })
}
