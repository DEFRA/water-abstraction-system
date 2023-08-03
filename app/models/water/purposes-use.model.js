'use strict'

/**
 * Model for purposesUses
 * @module PurposesUseModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class PurposesUseModel extends WaterBaseModel {
  static get tableName () {
    return 'purposesUses'
  }

  static get idColumn () {
    return 'purposeUseId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      chargePurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-purpose.model',
        join: {
          from: 'purposeUses.purposeUseId',
          to: 'chargePurposes.purposeUseId'
        }
      }
    }
  }
}

module.exports = PurposesUseModel
