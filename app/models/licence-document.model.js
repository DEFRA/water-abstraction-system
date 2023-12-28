'use strict'

/**
 * Model for licence_documents (crm_v2.documents)
 * @module LicenceDocumentModel
 */

const BaseModel = require('./base.model.js')

class LicenceDocumentModel extends BaseModel {
  static get tableName () {
    return 'licenceDocuments'
  }
}

module.exports = LicenceDocumentModel
