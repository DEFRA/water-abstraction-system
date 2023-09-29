'use strict'

/**
 * Model for billing_batches
 * @module BillRunModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class BillRunVolumeModel extends WaterBaseModel {
  static get tableName () {
    return 'billingVolumes'
  }

  static get idColumn () {
    return 'billingVolumeId'
  }

  static get translations () {
    return []
  }

  static get relationMappings () {
    return {
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill-run.model',
        join: {
          from: 'billingVolumes.billingBatchId',
          to: 'billingBatches.billingBatchId'
        }
      },
      chargeReference: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'billingVolumes.chargeElementId',
          to: 'chargeElements.chargeElementId'
        }
      }
    }
  }

  // NOTE: When we checked the live data the only statuses we could find in use were; 10, 40, 50, 60, 70, 90 and 100
  static get twoPartTariffStatuses () {
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

  $twoPartTariffStatus () {
    Object.entries(BillRunVolumeModel.twoPartTariffStatuses).forEach(([key, value]) => {
      if (value === this.twoPartTariffStatus) {
        return key
      }
    })

    return null
  }
}

module.exports = BillRunVolumeModel
