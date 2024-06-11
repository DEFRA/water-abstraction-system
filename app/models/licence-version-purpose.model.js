'use strict'

/**
 * Model for licence_version_purposes (water.licence_version_purposes)
 * @module LicenceVersionPurposeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionPurposeModel extends BaseModel {
  static get tableName () {
    return 'licenceVersionPurposes'
  }

  static get relationMappings () {
    return {
      licenceVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-version.model',
        join: {
          from: 'licenceVersionPurposes.licenceVersionId',
          to: 'licenceVersions.id'
        }
      },
      primaryPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'primary-purpose.model.js',
        join: {
          from: 'licenceVersionPurposes.primaryPurposeId',
          to: 'primaryPurposes.id'
        }
      },
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'purpose.model.js',
        join: {
          from: 'licenceVersionPurposes.purposeId',
          to: 'purposes.id'
        }
      }
    }
  }
}

module.exports = LicenceVersionPurposeModel
