'use strict'

/**
 * Model for form_logs
 * @module FormLogModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class FormLogModel extends BaseModel {
  static get tableName () {
    return 'formLogs'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'metadata'
    ]
  }

  static get relationMappings () {
    return {
      retrunSubmissions: {
        relation: Model.HasManyRelation,
        modelClass: 'return-submission.model',
        join: {
          from: 'formLogs.id',
          to: 'returnsubmissions.formLogId'
        }
      }
    }
  }
}

module.exports = FormLogModel
