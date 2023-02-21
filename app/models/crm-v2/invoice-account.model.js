'use strict'

/**
 * Model for invoiceAccounts
 * @module InvoiceAccountModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class InvoiceAccountModel extends WaterBaseModel {
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
      billingInvoices: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-invoice.model',
        join: {
          from: 'invoiceAccounts.invoiceAccountId',
          to: 'billingInvoices.invoiceAccountId'
        }
      }
    }
  }
}

module.exports = InvoiceAccountModel
