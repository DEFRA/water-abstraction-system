/**
 * Model for licence_document_roles (crm_v2.document_roles)
 * @module LicenceDocumentRoleModel
 */

import { Model } from 'objection'

import AddressModel from './address.model.js'
import BaseModel from './base.model.js'
import CompanyModel from './company.model.js'
import ContactModel from './contact.model.js'
import LicenceDocumentModel from './licence-document.model.js'
import LicenceRoleModel from './licence-role.model.js'

export default class LicenceDocumentRoleModel extends BaseModel {
  static get tableName() {
    return 'licenceDocumentRoles'
  }

  static get relationMappings() {
    return {
      address: {
        relation: Model.BelongsToOneRelation,
        modelClass: AddressModel,
        join: {
          from: 'licenceDocumentRoles.addressId',
          to: 'addresses.id'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: CompanyModel,
        join: {
          from: 'licenceDocumentRoles.companyId',
          to: 'companies.id'
        }
      },
      contact: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContactModel,
        join: {
          from: 'licenceDocumentRoles.contactId',
          to: 'contacts.id'
        }
      },
      licenceDocument: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceDocumentModel,
        join: {
          from: 'licenceDocumentRoles.licenceDocumentId',
          to: 'licenceDocuments.id'
        }
      },
      licenceRole: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceRoleModel,
        join: {
          from: 'licenceDocumentRoles.licenceRoleId',
          to: 'licenceRoles.id'
        }
      }
    }
  }
}
