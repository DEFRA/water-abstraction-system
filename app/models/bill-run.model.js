'use strict'

/**
 * Model for bill_runs (water.billing_batches)
 * @module BillRunModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class BillRunModel extends BaseModel {
  static get tableName() {
    return 'billRuns'
  }

  static get relationMappings() {
    return {
      billRunVolumes: {
        relation: Model.HasManyRelation,
        modelClass: 'bill-run-volume.model',
        join: {
          from: 'billRuns.id',
          to: 'billRunVolumes.billRunId'
        }
      },
      bills: {
        relation: Model.HasManyRelation,
        modelClass: 'bill.model',
        join: {
          from: 'billRuns.id',
          to: 'bills.billRunId'
        }
      },
      region: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'region.model',
        join: {
          from: 'billRuns.regionId',
          to: 'regions.id'
        }
      },
      reviewLicences: {
        relation: Model.HasManyRelation,
        modelClass: 'review-licence.model',
        join: {
          from: 'billRuns.id',
          to: 'reviewLicences.billRunId'
        }
      }
    }
  }

  static get errorCodes() {
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

module.exports = BillRunModel
