'use strict'

/**
 * Model for licence_documents (crm_v2.documents)
 * @module LicenceDocumentModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

/**
 * Represents an instance of a licence document record
 *
 * For reference, the licence document record is a 'nothing' record! It doesn't hold anything not already stored in
 * other licences. We only need to reference it in order to identify the companies and contacts linked to a licence, for
 * example, who the licence holder is. That information is held in `licence_document_roles`, and `licence_documents`
 * is the joining table between `licences` and it.
 *
 * We think the reason for the table being there is because of the previous teams attempts to refactor the `crm` schema.
 * Hence, we have `crm` and `crm_v2` in the DB. The `crm` schema is heavily linked to the `permit` schema and the idea
 * of a generic 'permit repository', which would be used to hold all sorts of permits and licences. This is also the
 * source of the generic name 'documents' for things like a licence.
 *
 * So, `licence_documents` is a less detailed copy of `licences` but with a different ID. We can't have two tables
 * called `licences`, nor can we think of a better name. So, LicenceDocument it is! ¯\_(ツ)_/¯
 */
class LicenceDocumentModel extends BaseModel {
  static get tableName() {
    return 'licenceDocuments'
  }

  static get relationMappings() {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceDocuments.licenceRef',
          to: 'licences.licenceRef'
        }
      },
      licenceDocumentRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-document-role.model',
        join: {
          from: 'licenceDocuments.id',
          to: 'licenceDocumentRoles.licenceDocumentId'
        }
      }
    }
  }
}

module.exports = LicenceDocumentModel
