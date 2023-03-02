'use strict'

/**
 * Model for billing_transactions
 * @module BillingTransactionModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class BillingTransactionModel extends WaterBaseModel {
  static get tableName () {
    return 'billingTransactions'
  }

  static get idColumn () {
    return 'billingTransactionId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      chargeElement: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'billingTransactions.chargeElementId',
          to: 'chargeElements.chargeElementId'
        }
      },
      billingInvoiceLicence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'billing-invoice-licence.model',
        join: {
          from: 'billingTransactions.billingInvoiceLicenceId',
          to: 'billingInvoiceLicences.billingInvoiceLicenceId'
        }
      }
    }
  }
}

module.exports = BillingTransactionModel
