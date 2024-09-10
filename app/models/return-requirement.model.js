'use strict'

/**
 * Model for return_requirements (water.return_requirements)
 * @module ReturnRequirementModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnRequirementModel extends BaseModel {
  static get tableName () {
    return 'returnRequirements'
  }

  static get relationMappings () {
    return {
      returnRequirementPoints: {
        relation: Model.HasManyRelation,
        modelClass: 'return-requirement-point.model',
        join: {
          from: 'returnRequirements.id',
          to: 'returnRequirementPoints.returnRequirementId'
        }
      },
      returnRequirementPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'return-requirement-purpose.model',
        join: {
          from: 'returnRequirements.id',
          to: 'returnRequirementPurposes.returnRequirementId'
        }
      },
      returnVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'return-version.model',
        join: {
          from: 'returnRequirements.returnVersionId',
          to: 'returnVersions.id'
        }
      }
    }
  }

  /**
   * Modifiers allow us to reuse logic in queries, eg. select the licence and everything to get the licence holder:
   *
   * ```javascript
   * return LicenceModel.query()
   *   .findById(licenceId)
   *   .modify('licenceHolder')
   * ```
   *
   * See {@link https://vincit.github.io/objection.js/recipes/modifiers.html | Modifiers} for more details
   *
   * @returns {object}
   */
  static get modifiers () {
    return {
      returnVersionExists (query) {

      }
    }
  }
}

module.exports = ReturnRequirementModel
