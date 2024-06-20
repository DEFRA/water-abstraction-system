'use strict'

/**
 * Model for return_versions (water.return_versions)
 * @module ReturnVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnVersionModel extends BaseModel {
  static get tableName () {
    return 'returnVersions'
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'returnVersions.licenceId',
          to: 'licences.id'
        }
      },
      returnRequirements: {
        relation: Model.HasManyRelation,
        modelClass: 'return-requirement.model',
        join: {
          from: 'returnVersions.id',
          to: 'returnRequirements.returnVersionId'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user.model',
        join: {
          from: 'returnVersions.createdBy',
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = ReturnVersionModel
