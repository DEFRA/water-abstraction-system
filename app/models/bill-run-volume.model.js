'use strict'

/**
 * Model for bill_run_volumes (water.billing_volumes)
 * @module BillRunVolumeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class BillRunVolumeModel extends BaseModel {
  static get tableName() {
    return 'billRunVolumes'
  }

  static get relationMappings() {
    return {
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill-run.model',
        join: {
          from: 'billRunVolumes.billRunId',
          to: 'billRuns.id'
        }
      },
      chargeReference: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'billRunVolumes.chargeReferenceId',
          to: 'chargeReferences.id'
        }
      }
    }
  }

  // NOTE: When we checked the live data the only statuses we could find in use were; 10, 40, 50, 60, 70, 90 and 100
  static get twoPartTariffStatuses() {
    return {
      noReturnsSubmitted: 10,
      underQuery: 20,
      received: 30,
      someReturnsDue: 40,
      lateReturns: 50,
      overAbstraction: 60,
      noReturnsForMatching: 70,
      notDueForBilling: 80,
      returnLineOverlapsChargePeriod: 90,
      noMatchingChargeElement: 100
    }
  }

  $twoPartTariffStatus() {
    const index = Object.values(BillRunVolumeModel.twoPartTariffStatuses).findIndex((value) => {
      return value === this.twoPartTariffStatus
    })

    if (index !== -1) {
      return Object.keys(BillRunVolumeModel.twoPartTariffStatuses)[index]
    }

    return null
  }
}

module.exports = BillRunVolumeModel
