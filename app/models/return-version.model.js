'use strict'

/**
 * Model for returnVersions (water.return_versions)
 * @module ReturnVersionsModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnVersionsModel extends BaseModel {
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
      returnRequirementPoints: {
        relation: Model.ManyToManyRelation,
        modelClass: 'return-requirement-point.model',
        join: {
          from: 'returnVersions.id',
          through: {
            from: 'returnRequirements.returnVersionId',
            to: 'returnRequirements.id'
          },
          to: 'returnRequirementPoints.returnRequirementId'
        }
      }
    }
  }
}

module.exports = ReturnVersionsModel
