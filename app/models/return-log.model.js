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
      returnSubmissions: {
        relation: Model.HasManyRelation,
        modelClass: 'return-submission.model',
        join: {
          from: 'returnLogs.id',
          to: 'returnSubmissions.returnLogId'
        }
      }
    }
  }
}

module.exports = ReturnLogModel
