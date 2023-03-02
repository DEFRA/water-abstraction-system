'use strict'

/**
 * Model for chargeVersions
 * @module ChargeVersionModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class ChargeVersionModel extends WaterBaseModel {
  static get tableName () {
    return 'chargeVersions'
  }

  static get idColumn () {
    return 'chargeVersionId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'chargeVersions.licenceId',
          to: 'licences.licenceId'
        }
      },
      changeReason: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'change-reason.model',
        join: {
          from: 'chargeVersions.changeReasonId',
          to: 'changeReasons.changeReasonId'
        }
      },
      chargeElements: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'chargeVersions.chargeVersionId',
          to: 'chargeElements.chargeVersionId'
        }
      }
    }
  }
}

module.exports = ChargeVersionModel
