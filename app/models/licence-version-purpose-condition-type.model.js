'use strict'

/**
 * Model for licence_version_purpose_condition_types (water.licence_version_purpose_condition_types)
 * @module LicenceVersionPurposeConditionTypeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionPurposeConditionTypeModel extends BaseModel {
  static get tableName() {
    return 'licenceVersionPurposeConditionTypes'
  }

  static get relationMappings() {
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

module.exports = LicenceVersionPurposeConditionTypeModel
