'use strict'

/**
 * Model for return_cycles (returns.return_cycle)
 * @module ReturnCycleModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnCycleModel extends BaseModel {
  static get tableName () {
    return 'returnCycles'
  }

  static get relationMappings () {
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

module.exports = ReturnCycleModel
