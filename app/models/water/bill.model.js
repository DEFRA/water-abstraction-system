'use strict'

/**
 * Model for billing_invoices
 * @module BillModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class BillModel extends WaterBaseModel {
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
      billLicences: {
        relation: Model.HasManyRelation,
        modelClass: 'bill-licence.model',
        join: {
          from: 'billingInvoices.billingInvoiceId',
          to: 'billingInvoiceLicences.billingInvoiceId'
        }
      }
    }
  }
}

module.exports = BillModel
