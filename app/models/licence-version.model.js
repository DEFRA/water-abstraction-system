'use strict'

/**
 * Model for licenceVersions (water.licence_versions)
 * @module LicenceVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionModel extends BaseModel {
  static get tableName () {
    return 'licenceVersions'
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceVersions.licenceId',
          to: 'licences.id'
        }
      },
      purposes: {
        relation: Model.ManyToManyRelation,
        modelClass: 'purpose.model',
        join: {
          from: 'licenceVersions.id',
          through: {
            from: 'licenceVersionPurposes.licenceVersionId',
            to: 'licenceVersionPurposes.purposeId'
          },
          to: 'purposes.id'
        }
      }
    }
  }
}

module.exports = LicenceVersionModel
