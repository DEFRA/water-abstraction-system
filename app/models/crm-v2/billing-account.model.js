'use strict'

/**
 * Model for invoice_accounts
 * @module BillingAccountModel
 */

const { Model } = require('objection')

const CrmV2BaseModel = require('./crm-v2-base.model.js')

class BillingAccountModel extends CrmV2BaseModel {
  static get tableName () {
    return 'invoiceAccounts'
  }

  static get idColumn () {
    return 'invoiceAccountId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      billingAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-account-address.model',
        join: {
          from: 'invoiceAccounts.invoiceAccountId',
          to: 'invoiceAccountAddresses.invoiceAccountId'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'company.model',
        join: {
          from: 'invoiceAccounts.companyId',
          to: 'companies.companyId'
        }
      }
    }
  }
}

module.exports = BillingAccountModel
