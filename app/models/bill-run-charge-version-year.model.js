'use strict'

/**
 * Model for bill_run_charge_version_years (water.billing_batch_charge_version_years)
 * @module BillRunChargeVersionYearModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class BillRunChargeVersionYearModel extends BaseModel {
  static get tableName () {
    return 'billRunChargeVersionYears'
  }

  static get relationMappings () {
    return {
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill-run.model',
        join: {
          from: 'billRunChargeVersionYears.billRunId',
          to: 'billRuns.id'
        }
      },
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'billRunChargeVersionYears.chargeVersionId',
          to: 'chargeVersions.id'
        }
      }
    }
  }
}

module.exports = BillRunChargeVersionYearModel
