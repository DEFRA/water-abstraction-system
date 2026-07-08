/**
 * Model for licence_roles (crm_v2.roles)
 * @module LicenceRoleModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import CompanyAddressModel from './company-address.model.js'
import CompanyContactModel from './company-contact.model.js'
import LicenceDocumentRoleModel from './licence-document-role.model.js'

class LicenceRoleModel extends BaseModel {
  static get tableName() {
    return 'licenceRoles'
  }

  static get relationMappings() {
    return {
      companyAddresses: {
        relation: Model.HasManyRelation,
        modelClass: CompanyAddressModel,
        join: {
          from: 'licenceRoles.id',
          to: 'companyAddresses.licenceRoleId'
        }
      },
      companyContacts: {
        relation: Model.HasManyRelation,
        modelClass: CompanyContactModel,
        join: {
          from: 'licenceRoles.id',
          to: 'companyContacts.licenceRoleId'
        }
      },
      licenceDocumentRoles: {
        relation: Model.HasManyRelation,
        modelClass: LicenceDocumentRoleModel,
        join: {
          from: 'licenceRoles.id',
          to: 'licenceDocumentRoles.licenceRoleId'
        }
      }
    }
  }
}

export default LicenceRoleModel
