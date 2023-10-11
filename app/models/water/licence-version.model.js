'use strict'

/**
 * Model for licenceVersions
 * @module LicenceVersionModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class LicenceVersionModel extends WaterBaseModel {
  static get tableName () {
    return 'licenceVersions'
  }

  static get idColumn () {
    return 'licenceVersionId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceVersions.licenceId',
          to: 'licences.licenceId'
        }
      }
    }
  }
}

module.exports = LicenceVersionModel
