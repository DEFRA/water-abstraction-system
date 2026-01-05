'use strict'

/**
 * Model for licence_version_holders (water.licence_version_holders)
 * @module LicenceVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionHolderModel extends BaseModel {
  static get tableName() {
    return 'licenceVersionHolders'
  }

  static get relationMappings() {
    return {
      licenceVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-version.model',
        join: {
          from: 'licenceVersionHolders.licenceVersionId',
          to: 'licenceVersions.id'
        }
      }
    }
  }
}

module.exports = LicenceVersionHolderModel
