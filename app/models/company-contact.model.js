'use strict'

/**
 * Model for company contact (crm_v2.company_contacts)
 * @module CompanyContactModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class CompanyContactModel extends BaseModel {
  static get tableName () {
    return 'company_contacts'
  }

  static get relationMappings () {
    return {
      companies: {
        relation: Model.HasManyRelation,
        modelClass: 'company.model',
        join: {
          from: 'company_contacts.companyId',
          to: 'companies.id'
        }
      },
      contacts: {
        relation: Model.HasManyRelation,
        modelClass: 'contact.model',
        join: {
          from: 'company_contacts.contactId',
          to: 'contacts.id'
        }
      }
    }
  }
}

module.exports = CompanyContactModel
