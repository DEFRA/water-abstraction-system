/**
 * Model for financial_agreements (water.financial_agreement_types)
 * @module FinancialAgreementModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceAgreementModel from './licence-agreement.model.js'

export default class FinancialAgreementModel extends BaseModel {
  static get tableName() {
    return 'financialAgreements'
  }

  static get relationMappings() {
    return {
      licenceAgreements: {
        relation: Model.HasManyRelation,
        modelClass: LicenceAgreementModel,
        join: {
          from: 'financialAgreements.id',
          to: 'licenceAgreements.financialAgreementId'
        }
      }
    }
  }
}