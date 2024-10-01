'use strict'

/**
 * Model for return_logs (returns.returns)
 * @module ReturnLogModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnLogModel extends BaseModel {
  static get tableName () {
    return 'returnLogs'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'metadata'
    ]
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'returnLogs.licenceRef',
          to: 'licences.licenceRef'
        }
      },
      returnSubmissions: {
        relation: Model.HasManyRelation,
        modelClass: 'return-submission.model',
        join: {
          from: 'returnLogs.id',
          to: 'returnSubmissions.returnLogId'
        }
      },
      returnCycle: {
        relation: Model.HasOneRelation,
        modelClass: 'return-cycle.model',
        join: {
          from: 'returnLogs.returnCycleId',
          to: 'returnCycles.id'
        }
      }
    }
  }
}

module.exports = ReturnLogModel
