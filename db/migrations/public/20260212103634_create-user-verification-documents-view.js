'use strict'

const viewName = 'user_verification_documents'

exports.up = function (knex) {
  return knex.schema.createView(viewName, (view) => {
    view.as(
      knex('verification_documents')
        .withSchema('crm')
        .select(['verification_id AS user_verification_id', 'document_id AS licence_document_header_id'])
    )
  })
}

exports.down = function (knex) {
  return knex.schema.dropViewIfExists(viewName)
}
