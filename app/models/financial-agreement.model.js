'use strict'

/**
 * Model for financial_agreements (water.financial_agreement_types)
 * @module FinancialAgreementModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class FinancialAgreementModel extends BaseModel {
  static get tableName() {
    return 'financialAgreements'
  }

  static get relationMappings() {
    return {
      licenceAgreements: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-agreement.model',
        join: {
          from: 'financialAgreements.id',
          to: 'licenceAgreements.financialAgreementId'
        }
      }
    }
  }
}

module.exports = FinancialAgreementModel
