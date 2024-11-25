'use strict'

/**
 * Model for billing_account_addresses (crm_v2.invoice_account_addresses)
 * @module BillingAccountAddressModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class BillingAccountAddressModel extends BaseModel {
  static get tableName() {
    return 'billingAccountAddresses'
  }

  static get relationMappings() {
    return {
      address: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'address.model',
        join: {
          from: 'billingAccountAddresses.addressId',
          to: 'addresses.id'
        }
      },
      billingAccount: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'billing-account.model',
        join: {
          from: 'billingAccountAddresses.billingAccountId',
          to: 'billingAccounts.id'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'company.model',
        join: {
          from: 'billingAccountAddresses.companyId',
          to: 'companies.id'
        }
      },
      contact: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'contact.model',
        join: {
          from: 'billingAccountAddresses.contactId',
          to: 'contacts.id'
        }
      }
    }
  }
}

module.exports = BillingAccountAddressModel
