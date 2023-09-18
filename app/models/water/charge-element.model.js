'use strict'

/**
 * Model for charge_purposes
 * @module ChargeElementModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class ChargeElementModel extends WaterBaseModel {
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
      chargeReference: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'chargePurposes.chargeElementId',
          to: 'chargeElements.chargeElementId'
        }
      },
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'purpose.model',
        join: {
          from: 'chargePurposes.purposeUseId',
          to: 'purposesUses.purposeUseId'
        }
      }
    }
  }
}

module.exports = ChargeElementModel
