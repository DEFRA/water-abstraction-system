'use strict'

/**
 * Model for licence_documents (crm_v2.documents)
 * @module LicenceDocumentModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceDocumentModel extends BaseModel {
  static get tableName () {
    return 'licenceDocuments'
  }

  static get relationMappings () {
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
