'use strict'

/**
 * Model for company
 * @module CompanyModel
 */

const { Model } = require('objection')

const CrmV2BaseModel = require('./crm-v2-base.model.js')

class CompanyModel extends CrmV2BaseModel {
  static get tableName () {
    return 'companies'
  }

  static get idColumn () {
    return 'companyId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      invoiceAccounts: {
        relation: Model.HasManyRelation,
        modelClass: 'invoice-account.model',
        join: {
          from: 'companies.companyId',
          to: 'invoiceAccounts.companyId'
        }
      },
      invoiceAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'invoice-account-address.model',
        join: {
          from: 'companies.companyId',
          to: 'invoiceAccountAddresses.agentCompanyId'
        }
      }
    }
  }
}

module.exports = CompanyModel
