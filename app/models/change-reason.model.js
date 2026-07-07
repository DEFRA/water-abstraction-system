/**
 * Model for change_reasons (water.change_reasons)
 * @module ChangeReasonModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

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

export default ChangeReasonModel
