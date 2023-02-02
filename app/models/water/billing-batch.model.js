'use strict'

/**
 * Model for billingBatches
 * @module BillingBatchModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class BillingBatchModel extends WaterBaseModel {
  static get tableName () {
    return 'billingBatches'
  }

  static get idColumn () {
    return 'billingBatchId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      region: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'region.model',
        join: {
          from: 'billingBatches.regionId',
          to: 'regions.regionId'
        }
      },
      billingInvoices: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-invoice.model',
        join: {
          from: 'billingBatches.billingBatchId',
          to: 'billingInvoices.billingBatchId'
        }
      }
    }
  }

  static get errorCodes () {
    return {
      failedToPopulateChargeVersions: 10,
      failedToProcessChargeVersions: 20,
      failedToPrepareTransactions: 30,
      failedToCreateCharge: 40,
      failedToCreateBillRun: 50,
      failedToDeleteInvoice: 60,
      failedToProcessTwoPartTariff: 70,
      failedToGetChargeModuleBillRunSummary: 80,
      failedToProcessRebilling: 90
    }
  }
}

module.exports = BillingBatchModel
