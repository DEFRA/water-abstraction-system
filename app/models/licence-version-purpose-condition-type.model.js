'use strict'

/**
 * Model for LicenceVersionPurposeConditionType (water.licence_version_purpose_condition_types)
 * @module LicenceVersionPurposeConditionTypes
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionPurposeConditionTypes extends BaseModel {
  static get tableName () {
    return 'licenceVersionPurposeConditionTypes'
  }

  static get relationMappings () {
    return {
      licenceVersionPurposeConditions: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-version-purpose-condition.model',
        join: {
          from: 'licenceVersionPurposeConditionTypes.id',
          to: 'licenceVersionPurposeConditions.licenceVersionPurposeConditionTypeId'
        }
      }
    }
  }
}

module.exports = LicenceVersionPurposeConditionTypes
