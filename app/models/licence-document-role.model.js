'use strict'

/**
 * Model for licence_document_roles (crm_v2.document_roles)
 * @module LicenceDocumentRoleModel
 */

const BaseModel = require('./base.model.js')

class LicenceDocumentRoleModel extends BaseModel {
  static get tableName () {
    return 'licenceDocumentRoles'
  }
}

module.exports = LicenceDocumentRoleModel
