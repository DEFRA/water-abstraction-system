'use strict'

/**
 * Model for billingChargeCategories
 * @module BillingChargeCategoryModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class BillingChargeCategoryModel extends WaterBaseModel {
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
      chargeElements: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'billingChargeCategories.billingChargeCategoryId',
          to: 'chargeElements.billingChargeCategoryId'
        }
      }
    }
  }
}

module.exports = BillingChargeCategoryModel
