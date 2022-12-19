'use strict'

/**
 * Model for water.charge_purposes
 * @module ChargePurposeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargePurposeModel extends BaseModel {
  static get tableName () {
    return 'water.charge_purposes'
  }

  static get idColumn () {
    return 'charge_purpose_id'
  }

  static get relationMappings () {
    return {
      chargeElement: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'water.charge_purposes.charge_element_id',
          to: 'water.charge_elements.charge_element_id'
        }
      }
    }
  }
}

module.exports = ChargePurposeModel
