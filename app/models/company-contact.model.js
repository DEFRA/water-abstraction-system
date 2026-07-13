/**
 * Model for company_contacts (crm_v2.company_contacts)
 * @module CompanyContactModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import CompanyModel from './company.model.js'
import ContactModel from './contact.model.js'
import LicenceRoleModel from './licence-role.model.js'
import UserModel from './user.model.js'

export default class CompanyContactModel extends BaseModel {
  static get tableName() {
    return 'companyContacts'
  }

  static get relationMappings() {
    return {
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: CompanyModel,
        join: {
          from: 'companyContacts.companyId',
          to: 'companies.id'
        }
      },
      contact: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContactModel,
        join: {
          from: 'companyContacts.contactId',
          to: 'contacts.id'
        }
      },
      createdByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'companyContacts.createdBy',
          to: 'users.id'
        }
      },
      licenceRole: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceRoleModel,
        join: {
          from: 'companyContacts.licenceRoleId',
          to: 'licenceRoles.id'
        }
      },
      updatedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'companyContacts.updatedBy',
          to: 'users.id'
        }
      }
    }
  }

  /**
   * Maps the `abstractionAlerts` flag and linked licences to the journey string value ('yes', 'some', or 'no')
   *
   * @returns {string} 'yes', 'some', or 'no'
   */
  $abstractionAlertType() {
    if (!this.abstractionAlerts) {
      return 'no'
    }

    return this.abstractionAlertLicences ? 'some' : 'yes'
  }
}
