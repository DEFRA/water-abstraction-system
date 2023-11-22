'use strict'

/**
 * Model for return_submissions
 * @module ReturnSubmissionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnSubmissionModel extends BaseModel {
  static get tableName () {
    return 'returnSubmissions'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'metadata'
    ]
  }

  static get relationMappings () {
    return {
      formLog: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'form-log.model',
        join: {
          from: 'returnSubmissions.formLogId',
          to: 'formLogs.id'
        }
      },
      returnSubmissionLines: {
        relation: Model.HasManyRelation,
        modelClass: 'return-submission-line.model',
        join: {
          from: 'returnSubmissions.id',
          to: 'returnSubmissionLines.returnSubmissionId'
        }
      }
    }
  }
}

module.exports = ReturnSubmissionModel
