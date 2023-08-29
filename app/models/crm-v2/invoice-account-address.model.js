'use strict'

/**
 * Model for invoiceAccountAddresses
 * @module InvoiceAccountAddressModel
 */

const { Model } = require('objection')

const CrmV2BaseModel = require('./crm-v2-base.model.js')

class InvoiceAccountAddressModel extends CrmV2BaseModel {
  static get tableName () {
    return 'invoiceAccountAddresses'
  }

  static get idColumn () {
    return 'invoiceAccountAddressId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      address: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'address.model',
        join: {
          from: 'invoiceAccountAddresses.addressId',
          to: 'addresses.addressId'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'company.model',
        join: {
          from: 'invoiceAccountAddresses.agentCompanyId',
          to: 'companies.companyId'
        }
      },
      contact: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'contact.model',
        join: {
          from: 'invoiceAccountAddresses.contactId',
          to: 'contacts.contactId'
        }
      },
      invoiceAccount: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'invoice-account.model',
        join: {
          from: 'invoiceAccountAddresses.invoiceAccountId',
          to: 'invoiceAccounts.invoiceAccountId'
        }
      }
    }
  }
}

module.exports = InvoiceAccountAddressModel
