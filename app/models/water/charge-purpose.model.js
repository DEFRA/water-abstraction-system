'use strict'

/**
 * Model for chargePurposes
 * @module ChargePurposeModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class ChargePurposeModel extends WaterBaseModel {
  static get tableName () {
    return 'chargePurposes'
  }

  static get idColumn () {
    return 'chargePurposeId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      chargeElement: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'chargePurposes.chargeElementId',
          to: 'chargeElements.chargeElementId'
        }
      }
    }
  }
}

module.exports = ChargePurposeModel
