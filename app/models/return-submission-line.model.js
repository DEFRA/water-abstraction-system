/**
 * Model for return_submission_lines (returns.lines)
 * @module ReturnSubmissionLineModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import ReturnSubmissionModel from './return-submission.model.js'

export default class ReturnSubmissionLineModel extends BaseModel {
  static get tableName() {
    return 'returnSubmissionLines'
  }

  static get relationMappings() {
    return {
      returnSubmission: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReturnSubmissionModel,
        join: {
          from: 'returnSubmissionLines.returnSubmissionId',
          to: 'returnSubmissions.id'
        }
      }
    }
  }
}