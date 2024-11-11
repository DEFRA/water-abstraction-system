'use strict'

/**
 * Model for company_contacts (crm_v2.company_contacts)
 * @module CompanyContactModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class CompanyContactModel extends BaseModel {
  static get tableName() {
    return 'companyContacts'
  }

  static get relationMappings() {
    return {
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'company.model',
        join: {
          from: 'companyContacts.companyId',
          to: 'companies.id'
        }
      },
      contact: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'contact.model',
        join: {
          from: 'companyContacts.contactId',
          to: 'contacts.id'
        }
      },
      licenceRole: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-role.model',
        join: {
          from: 'companyContacts.licenceRoleId',
          to: 'licenceRoles.id'
        }
      }
    }
  }
}

module.exports = CompanyContactModel
