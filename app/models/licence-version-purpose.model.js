'use strict'

/**
 * Model for LicenceVersionPurposes (water.licence_version_purposes)
 * @module LicenceVersionPurposes
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionPurposes extends BaseModel {
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

module.exports = LicenceVersionPurposes
