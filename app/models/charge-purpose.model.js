'use strict'

/**
 * Model for chargePurposes
 * @module ChargePurposeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargePurposeModel extends BaseModel {
  static get tableName () {
    return 'chargePurposes'
  }

  static get idColumn () {
    return 'chargePurposeId'
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
