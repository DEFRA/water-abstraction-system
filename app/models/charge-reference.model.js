'use strict'

/**
 * Model for charge_references
 * @module ChargeReferenceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeReferenceModel extends BaseModel {
  static get tableName () {
    return 'chargeReferences'
  }

  static get relationMappings () {
    return {
      billRunVolumes: {
        relation: Model.HasManyRelation,
        modelClass: 'bill-run-volume.model',
        join: {
          from: 'chargeReferences.id',
          to: 'billRunVolumes.chargeReferenceId'
        }
      },
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'chargeReferences.chargeVersionId',
          to: 'chargeVersions.id'
        }
      },
      chargeCategory: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-category.model',
        join: {
          from: 'chargeReferences.chargeCategoryId',
          to: 'chargeCategories.id'
        }
      },
      chargeElements: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'chargeReferences.id',
          to: 'chargeElements.chargeReferenceId'
        }
      },
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'purpose.model',
        join: {
          from: 'chargeReferences.purposeId',
          to: 'purposes.id'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'chargeReferences.id',
          to: 'transactions.chargeReferenceId'
        }
      }
    }
  }
}

module.exports = ChargeReferenceModel
