const viewName = 'review_returns'

export function up(knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('review_returns')
        .withSchema('water')
        .select([
          'id',
          'review_licence_id',
          'return_id',
          'return_reference',
          'quantity',
          'allocated',
          'under_query',
          'return_status',
          'nil_return',
          'abstraction_outside_period',
          'received_date',
          'due_date',
          'purposes',
          'description',
          'start_date',
          'end_date',
          'issues',
          'created_at',
          'updated_at'
        ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName)
}
