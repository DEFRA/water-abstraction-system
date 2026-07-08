/**
 * Model for charge_references (water.charge_elements)
 * @module ChargeReferenceModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import BillRunVolumeModel from './bill-run-volume.model.js'
import ChargeCategoryModel from './charge-category.model.js'
import ChargeElementModel from './charge-element.model.js'
import ChargeVersionModel from './charge-version.model.js'
import PurposeModel from './purpose.model.js'
import ReviewChargeReferenceModel from './review-charge-reference.model.js'
import TransactionModel from './transaction.model.js'

class ChargeReferenceModel extends BaseModel {
  static get tableName() {
    return 'chargeReferences'
  }

  static get relationMappings() {
    return {
      billRunVolumes: {
        relation: Model.HasManyRelation,
        modelClass: BillRunVolumeModel,
        join: {
          from: 'chargeReferences.id',
          to: 'billRunVolumes.chargeReferenceId'
        }
      },
      chargeCategory: {
        relation: Model.BelongsToOneRelation,
        modelClass: ChargeCategoryModel,
        join: {
          from: 'chargeReferences.chargeCategoryId',
          to: 'chargeCategories.id'
        }
      },
      chargeElements: {
        relation: Model.HasManyRelation,
        modelClass: ChargeElementModel,
        join: {
          from: 'chargeReferences.id',
          to: 'chargeElements.chargeReferenceId'
        }
      },
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: ChargeVersionModel,
        join: {
          from: 'chargeReferences.chargeVersionId',
          to: 'chargeVersions.id'
        }
      },
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: PurposeModel,
        join: {
          from: 'chargeReferences.purposeId',
          to: 'purposes.id'
        }
      },
      reviewChargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: ReviewChargeReferenceModel,
        join: {
          from: 'chargeReferences.id',
          to: 'reviewChargeReferences.chargeReferenceId'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: TransactionModel,
        join: {
          from: 'chargeReferences.id',
          to: 'transactions.chargeReferenceId'
        }
      }
    }
  }
}

export default ChargeReferenceModel
