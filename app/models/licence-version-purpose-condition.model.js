'use strict'

/**
 * Model for LicenceVersionPurposeCondition (water.licence_version_purpose_conditions)
 * @module LicenceVersionPurposeConditions
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionPurposeConditions extends BaseModel {
  static get tableName () {
    return 'licenceVersionPurposeConditions'
  }

  static get relationMappings () {
    return {
      licenceVersionPurposeConditionTypes: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-version-purpose-condition-type.model',
        join: {
          from: 'licenceVersionPurposeConditions.licenceVersionPurposeConditionTypeId',
          to: 'licenceVersionPurposeConditionTypes.id'
        }
      }
    }
  }
}

module.exports = LicenceVersionPurposeConditions
