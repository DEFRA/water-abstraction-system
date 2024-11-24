'use strict'

/**
 * Model for licence_agreements (water.licence_agreements)
 * @module LicenceAgreementModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceAgreementModel extends BaseModel {
  static get tableName() {
    return 'licenceAgreements'
  }

  static get relationMappings() {
    return {
      financialAgreement: {
        relation: Model.HasOneRelation,
        modelClass: 'financial-agreement.model',
        join: {
          from: 'licenceAgreements.financialAgreementId',
          to: 'financialAgreements.id'
        }
      },
      licence: {
        relation: Model.HasOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceAgreements.licenceRef',
          to: 'licences.licenceRef'
        }
      }
    }
  }
}

module.exports = LicenceAgreementModel
