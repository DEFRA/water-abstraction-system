'use strict'

/**
 * Model for billingInvoices
 * @module BillingInvoiceModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class BillingInvoiceModel extends WaterBaseModel {
  static get tableName () {
    return 'billingInvoices'
  }

  static get idColumn () {
    return 'billingInvoiceId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill-run.model',
        join: {
          from: 'billingInvoices.billingBatchId',
          to: 'billingBatches.billingBatchId'
        }
      },
      billingInvoiceLicences: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-invoice-licence.model',
        join: {
          from: 'billingInvoices.billingInvoiceId',
          to: 'billingInvoiceLicences.billingInvoiceId'
        }
      }
    }
  }
}

module.exports = BillingInvoiceModel
