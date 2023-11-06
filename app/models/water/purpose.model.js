'use strict'

/**
 * Model for purposes_uses
 * @module PurposeModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class PurposeModel extends WaterBaseModel {
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
      chargeElements: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'purposesUses.purposeUseId',
          to: 'chargePurposes.purposeUseId'
        }
      },
      chargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'purposesUses.purposeUseId',
          to: 'chargeElements.purposeUseId'
        }
      }
    }
  }
}

module.exports = PurposeModel
