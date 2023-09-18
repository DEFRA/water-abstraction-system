'use strict'

/**
 * Model for charge_elements
 * @module ChargeReferenceModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class ChargeReferenceModel extends WaterBaseModel {
  static get tableName () {
    return 'chargeElements'
  }

  static get idColumn () {
    return 'chargeElementId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get alias () {
    return 'chargeReferences'
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
      chargeCategory: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-category.model',
        join: {
          from: 'chargeElements.billingChargeCategoryId',
          to: 'billingChargeCategories.billingChargeCategoryId'
        }
      },
      chargeElements: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'chargeElements.chargeElementId',
          to: 'chargePurposes.chargeElementId'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'chargeElements.chargeElementId',
          to: 'billingTransactions.chargeElementId'
        }
      }
    }
  }
}

module.exports = ChargeReferenceModel
