'use strict'

/**
 * Model for licence_document_roles (crm_v2.document_roles)
 * @module LicenceDocumentRoleModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceDocumentRoleModel extends BaseModel {
  static get tableName() {
    return 'licenceDocumentRoles'
  }

  static get relationMappings() {
    return {
      address: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'address.model',
        join: {
          from: 'licenceDocumentRoles.addressId',
          to: 'addresses.id'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'company.model',
        join: {
          from: 'licenceDocumentRoles.companyId',
          to: 'companies.id'
        }
      },
      contact: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'contact.model',
        join: {
          from: 'licenceDocumentRoles.contactId',
          to: 'contacts.id'
        }
      },
      licenceDocument: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-document.model',
        join: {
          from: 'licenceDocumentRoles.licenceDocumentId',
          to: 'licenceDocuments.id'
        }
      },
      licenceRole: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-role.model',
        join: {
          from: 'licenceDocumentRoles.licenceRoleId',
          to: 'licenceRoles.id'
        }
      }
    }
  }
}

module.exports = LicenceDocumentRoleModel
