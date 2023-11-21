'use strict'

/**
 * Model for return_submission_lines
 * @module ReturnSubmissionLineModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnSubmissionLineModel extends BaseModel {
  static get tableName () {
    return 'returnSubmissionLines'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'metadata'
    ]
  }

  static get relationMappings () {
    return {
      version: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'return-submission.model',
        join: {
          from: 'returnSubmissionLines.returnSubmissionId',
          to: 'returnSubmissions.id'
        }
      }
    }
  }
}

module.exports = ReturnSubmissionLineModel
