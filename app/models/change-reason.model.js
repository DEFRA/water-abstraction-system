'use strict'

/**
 * Model for change_reasons (water.change_reasons)
 * @module ChangeReasonModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChangeReasonModel extends BaseModel {
  static get tableName() {
    return 'changeReasons'
  }

  static get relationMappings() {
    return {
      chargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'changeReasons.id',
          to: 'chargeVersions.changeReasonId'
        }
      }
    }
  }
}

module.exports = ChangeReasonModel
