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
      bills: {
        relation: Model.HasManyRelation,
        modelClass: 'bill.model',
        join: {
          from: 'billingAccounts.id',
          to: 'bills.billingAccountId'
        }
      },
      billingAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-account-address.model',
        join: {
          from: 'billingAccounts.id',
          to: 'billingAccountAddresses.billingAccountId'
        }
      },
      bills: {
        relation: Model.HasManyRelation,
        modelClass: 'bill.model',
        join: {
          from: 'billingAccounts.id',
          to: 'bills.billingAccountId'
        }
      },
      chargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'billingAccounts.id',
          to: 'chargeVersions.billingAccountId'
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
