/**
 * Model for review_licences
 * @module ReviewLicenceModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import BillRunModel from './bill-run.model.js'
import LicenceModel from './licence.model.js'
import ReviewChargeVersionModel from './review-charge-version.model.js'
import ReviewReturnModel from './review-return.model.js'

export default class ReviewLicenceModel extends BaseModel {
  static get tableName() {
    return 'reviewLicences'
  }

  static get relationMappings() {
    return {
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: BillRunModel,
        join: {
          from: 'reviewLicences.billRunId',
          to: 'billRuns.id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceModel,
        join: {
          from: 'reviewLicences.licenceId',
          to: 'licences.id'
        }
      },
      reviewChargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: ReviewChargeVersionModel,
        join: {
          from: 'reviewLicences.id',
          to: 'reviewChargeVersions.reviewLicenceId'
        }
      },
      reviewReturns: {
        relation: Model.HasManyRelation,
        modelClass: ReviewReturnModel,
        join: {
          from: 'reviewLicences.id',
          to: 'reviewReturns.reviewLicenceId'
        }
      }
    }
  }
}