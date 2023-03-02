'use strict'

/**
 * Model for billingInvoiceLicences
 * @module BillingInvoiceLicenceModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class BillingInvoiceLicenceModel extends WaterBaseModel {
  static get tableName () {
    return 'billingInvoiceLicences'
  }

  static get idColumn () {
    return 'billingInvoiceLicenceId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      billingInvoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'billing-invoice.model',
        join: {
          from: 'billingInvoiceLicences.billingInvoiceId',
          to: 'billingInvoices.billingInvoiceId'
        }
      },
      billingTransactions: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-transaction.model',
        join: {
          from: 'billingInvoiceLicences.billingInvoiceLicenceId',
          to: 'billingTransactions.billingInvoiceLicenceId'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'billingInvoiceLicences.licenceId',
          to: 'licences.licenceId'
        }
      }
    }
  }
}

module.exports = BillingInvoiceLicenceModel
