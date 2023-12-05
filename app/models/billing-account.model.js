'use strict'

/**
 * Model for billing_accounts (crm_v2.invoice_accounts)
 * @module BillingAccountModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class BillingAccountModel extends BaseModel {
  static get tableName () {
    return 'billingAccounts'
  }

  static get relationMappings () {
    return {
      billingAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-account-address.model',
        join: {
          from: 'billingAccounts.id',
          to: 'billingAccountAddresses.billingAccountId'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'company.model',
        join: {
          from: 'billingAccounts.companyId',
          to: 'companies.id'
        }
      }
    }
  }
}

module.exports = BillingAccountModel
