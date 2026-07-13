/**
 * Model for permit_licences (permit.licence)
 * @module PermitLicenceModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceModel from './licence.model.js'

export default class PermitLicenceModel extends BaseModel {
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
        modelClass: LicenceModel,
        join: {
          from: 'permitLicences.licenceRef',
          to: 'licences.licenceRef'
        }
      }
    }
  }
}
