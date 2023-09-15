'use strict'

/**
 * Model for changeReasons
 * @module ChangeReasonModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class ChangeReasonModel extends WaterBaseModel {
  static get tableName () {
    return 'changeReasons'
  }

  static get idColumn () {
    return 'changeReasonId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      chargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'changeReasons.changeReasonId',
          to: 'chargeVersions.changeReasonId'
        }
      }
    }
  }
}

module.exports = ChangeReasonModel
