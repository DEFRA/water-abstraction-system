const viewName = 'return_cycles'

export function up(knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('return_cycles')
        .withSchema('returns')
        .select([
          'return_cycle_id AS id',
          'start_date',
          'end_date',
          'due_date',
          'is_summer AS summer',
          'is_submitted_in_wrls AS submitted_in_wrls',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName)
}
