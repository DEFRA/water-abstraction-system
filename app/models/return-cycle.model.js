/**
 * Model for return_cycles (returns.return_cycle)
 * @module ReturnCycleModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class ReturnCycleModel extends BaseModel {
  static get tableName() {
    return 'returnCycles'
  }

  static get relationMappings() {
    return {
      returnLogs: {
        relation: Model.HasManyRelation,
        modelClass: 'return-log.model',
        join: {
          from: 'returnCycles.id',
          to: 'returnLogs.returnCycleId'
        }
      }
    }
  }
}

export default ReturnCycleModel
