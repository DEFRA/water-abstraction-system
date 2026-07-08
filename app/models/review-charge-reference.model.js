/**
 * Model for review_charge_references
 * @module ReviewChargeReferenceModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import ChargeReferenceModel from './charge-reference.model.js'
import ReviewChargeElementModel from './review-charge-element.model.js'
import ReviewChargeVersionModel from './review-charge-version.model.js'

class ReviewChargeReferenceModel extends BaseModel {
  static get tableName() {
    return 'reviewChargeReferences'
  }

  static get relationMappings() {
    return {
      reviewChargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReviewChargeVersionModel,
        join: {
          from: 'reviewChargeReferences.reviewChargeVersionId',
          to: 'reviewChargeVersions.id'
        }
      },
      reviewChargeElements: {
        relation: Model.HasManyRelation,
        modelClass: ReviewChargeElementModel,
        join: {
          from: 'reviewChargeReferences.id',
          to: 'reviewChargeElements.reviewChargeReferenceId'
        }
      },
      chargeReference: {
        relation: Model.BelongsToOneRelation,
        modelClass: ChargeReferenceModel,
        join: {
          from: 'reviewChargeReferences.chargeReferenceId',
          to: 'chargeReferences.id'
        }
      }
    }
  }
}

export default ReviewChargeReferenceModel
