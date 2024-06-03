'use strict'

/**
 * Model for LicenceAgreements (water.licence_agreements)
 * @module LicenceAgreementModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceAgreementModel extends BaseModel {
  static get tableName () {
    return 'licenceAgreements'
  }

  static get relationMappings () {
    return {
      financialAgreements: {
        relation: Model.HasManyRelation,
        modelClass: 'financial-agreement.model',
        join: {
          from: 'licenceAgreements.financialAgreementId',
          to: 'financialAgreements.id'
        }
      }
    }
  }
}

module.exports = LicenceAgreementModel
