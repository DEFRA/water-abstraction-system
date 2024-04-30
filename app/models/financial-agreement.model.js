'use strict'

/**
 * Model for FinancialAgreements (water.financial_agreements)
 * @module FinancialAgreements
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class FinancialAgreements extends BaseModel {
  static get tableName () {
    return 'financialAgreements'
  }

  static get relationMappings () {
    return {
      licenceAgreementTypes: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-agreement.model',
        join: {
          from: 'licenceAgreementTypes.id',
          to: 'financialAgreements.financialAgreementTypeId'
        }
      }
    }
  }
}

module.exports = FinancialAgreements
