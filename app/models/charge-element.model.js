'use strict'

/**
 * Model for charge_elements (water.charge_purposes)
 * @module ChargeElementModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeElementModel extends BaseModel {
  static get tableName() {
    return 'chargeElements'
  }

  static get relationMappings() {
    return {
      chargeReference: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'chargeElements.chargeReferenceId',
          to: 'chargeReferences.id'
        }
      },
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'purpose.model',
        join: {
          from: 'chargeElements.purposeId',
          to: 'purposes.id'
        }
      },
      reviewChargeElements: {
        relation: Model.HasManyRelation,
        modelClass: 'review-charge-element.model',
        join: {
          from: 'chargeElements.id',
          to: 'reviewChargeElements.chargeElementId'
        }
      }
    }
  }
}

module.exports = ChargeElementModel
