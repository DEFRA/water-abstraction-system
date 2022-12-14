'use strict'

/**
 * Model for chargeVersions
 * @module ChargeVersionModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class ChargeVersionModel extends WaterBaseModel {
  static get tableName () {
    return 'chargeVersions'
  }

  static get idColumn () {
    return 'chargeVersionId'
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'chargeVersions.licenceId',
          to: 'licences.licenceId'
        }
      },
      chargeElements: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'chargeVersions.chargeVersionId',
          to: 'chargeElements.chargeVersionId'
        }
      }
    }
  }
}

module.exports = ChargeVersionModel
