/**
 * Model for return_logs (returns.returns)
 * @module ReturnLogModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceModel from './licence.model.js'
import ReturnCycleModel from './return-cycle.model.js'
import ReturnRequirementModel from './return-requirement.model.js'
import ReturnSubmissionModel from './return-submission.model.js'
import ReviewReturnModel from './review-return.model.js'

class ReturnLogModel extends BaseModel {
  static get tableName() {
    return 'returnLogs'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['metadata']
  }

  static get relationMappings() {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceModel,
        join: {
          from: 'returnLogs.licenceRef',
          to: 'licences.licenceRef'
        }
      },
      returnCycle: {
        relation: Model.HasOneRelation,
        modelClass: ReturnCycleModel,
        join: {
          from: 'returnLogs.returnCycleId',
          to: 'returnCycles.id'
        }
      },
      returnRequirement: {
        relation: Model.HasOneRelation,
        modelClass: ReturnRequirementModel,
        join: {
          from: 'returnLogs.returnRequirementId',
          to: 'returnRequirements.id'
        }
      },
      returnSubmissions: {
        relation: Model.HasManyRelation,
        modelClass: ReturnSubmissionModel,
        join: {
          from: 'returnLogs.id',
          to: 'returnSubmissions.returnLogId'
        }
      },
      reviewReturns: {
        relation: Model.HasManyRelation,
        modelClass: ReviewReturnModel,
        join: {
          from: 'returnLogs.id',
          to: 'reviewReturns.returnLogId'
        }
      }
    }
  }
}

export default ReturnLogModel
