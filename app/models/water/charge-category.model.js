'use strict'

/**
 * Model for billing_charge_categories
 * @module ChargeCategoryModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class ChargeCategoryModel extends WaterBaseModel {
  static get tableName () {
    return 'billingChargeCategories'
  }

  static get idColumn () {
    return 'billingChargeCategoryId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      chargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'billingChargeCategories.billingChargeCategoryId',
          to: 'chargeElements.billingChargeCategoryId'
        }
      }
    }
  }
}

module.exports = ChargeCategoryModel
