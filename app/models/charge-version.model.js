'use strict'

/**
 * Model for charge_versions (water.charge_versions)
 * @module ChargeVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeVersionModel extends BaseModel {
  static get tableName () {
    return 'chargeVersions'
  }

  static get relationMappings () {
    return {
      billingAccount: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'billing-account.model',
        join: {
          from: 'chargeVersions.billingAccountId',
          to: 'billingAccounts.id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'chargeVersions.licenceId',
          to: 'licences.id'
        }
      },
      changeReason: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'change-reason.model',
        join: {
          from: 'chargeVersions.changeReasonId',
          to: 'changeReasons.id'
        }
      },
      chargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'chargeVersions.id',
          to: 'chargeReferences.chargeVersionId'
        }
      }
    }
  }
}

module.exports = ChargeVersionModel
