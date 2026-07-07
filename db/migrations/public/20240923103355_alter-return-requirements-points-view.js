const viewName = 'return_requirement_points'

export function up(knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('return_requirement_points')
        .withSchema('water')
        .select([
          'id',
          'return_requirement_id',
          'point_id',
          'external_id',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}

export function down(knex) {
  return knex.schema.dropViewIfExists(viewName).createView(viewName, (view) => {
    view.as(
      knex('return_requirement_points')
        .withSchema('water')
        .select([
          'id',
          'return_requirement_id',
          'description',
          'ngr_1',
          'ngr_2',
          'ngr_3',
          'ngr_4',
          'external_id',
          'nald_point_id',
          'date_created AS created_at',
          'date_updated AS updated_at'
        ])
    )
  })
}
