/**
 * Model for bill_runs (water.billing_batches)
 * @module BillRunModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import BillModel from './bill.model.js'
import BillRunVolumeModel from './bill-run-volume.model.js'
import RegionModel from './region.model.js'
import ReviewLicenceModel from './review-licence.model.js'

export default class BillRunModel extends BaseModel {
  static get tableName() {
    return 'billRuns'
  }

  static get relationMappings() {
    return {
      billRunVolumes: {
        relation: Model.HasManyRelation,
        modelClass: BillRunVolumeModel,
        join: {
          from: 'billRuns.id',
          to: 'billRunVolumes.billRunId'
        }
      },
      bills: {
        relation: Model.HasManyRelation,
        modelClass: BillModel,
        join: {
          from: 'billRuns.id',
          to: 'bills.billRunId'
        }
      },
      region: {
        relation: Model.BelongsToOneRelation,
        modelClass: RegionModel,
        join: {
          from: 'billRuns.regionId',
          to: 'regions.id'
        }
      },
      reviewLicences: {
        relation: Model.HasManyRelation,
        modelClass: ReviewLicenceModel,
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