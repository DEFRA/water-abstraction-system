'use strict'

/**
 * Model for permit_licences (permit.licence)
 * @module PermitLicenceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class PermitLicenceModel extends BaseModel {
  static get tableName() {
    return 'permitLicences'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['licence_value_data']
  }

  static get relationMappings() {
    return {
      permitLicence: {
        relation: Model.HasOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'permitLicences.licenceRef',
          to: 'licences.licenceRef'
        }
      }
    }
  }
}

module.exports = PermitLicenceModel
