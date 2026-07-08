/**
 * Model for licence_agreements (water.licence_agreements)
 * @module LicenceAgreementModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import FinancialAgreementModel from './financial-agreement.model.js'
import LicenceModel from './licence.model.js'

export default class LicenceAgreementModel extends BaseModel {
  static get tableName() {
    return 'licenceAgreements'
  }

  static get relationMappings() {
    return {
      financialAgreement: {
        relation: Model.HasOneRelation,
        modelClass: FinancialAgreementModel,
        join: {
          from: 'licenceAgreements.financialAgreementId',
          to: 'financialAgreements.id'
        }
      },
      licence: {
        relation: Model.HasOneRelation,
        modelClass: LicenceModel,
        join: {
          from: 'licenceAgreements.licenceRef',
          to: 'licences.licenceRef'
        }
      }
    }
  }
}