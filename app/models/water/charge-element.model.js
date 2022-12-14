'use strict'

/**
 * Model for chargeElements
 * @module ChargeElementModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class ChargeElementModel extends WaterBaseModel {
  static get tableName () {
    return 'chargeElements'
  }

  static get idColumn () {
    return 'chargeElementId'
  }

  static get relationMappings () {
    return {
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'chargeElements.chargeVersionId',
          to: 'chargeVersions.chargeVersionId'
        }
      },
      billingChargeCategory: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'billing-charge-category.model',
        join: {
          from: 'chargeElements.billingChargeCategoryId',
          to: 'billingChargeCategories.billingChargeCategoryId'
        }
      },
      chargePurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-purpose.model',
        join: {
          from: 'chargeElements.chargeElementId',
          to: 'chargePurposes.chargeElementId'
        }
      }
    }
  }
}

module.exports = ChargeElementModel
