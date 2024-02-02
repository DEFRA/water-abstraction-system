'use strict'

/**
 * Model for licenceVersionPurposes (water.licence_version_purposes)
 * @module licenceVersionPurposes
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class licenceVersionPurposes extends BaseModel {
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
      }
    }
  }
}

module.exports = licenceVersionPurposes
