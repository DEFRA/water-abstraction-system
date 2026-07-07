/**
 * Model for return_submission_lines (returns.lines)
 * @module ReturnSubmissionLineModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class ReturnSubmissionLineModel extends BaseModel {
  static get tableName() {
    return 'returnSubmissionLines'
  }

  static get relationMappings() {
    return {
      returnSubmission: {
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

export default ReturnSubmissionLineModel
