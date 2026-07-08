/**
 * Model for licence_unregistrations (water.licence_unregistrations)
 * @module LicenceUnregistrationModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceModel from './licence.model.js'
import UserModel from './user.model.js'

class LicenceUnregistrationModel extends BaseModel {
  static get tableName() {
    return 'licenceUnregistrations'
  }

  static get relationMappings() {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceModel,
        join: {
          from: 'licenceUnregistrations.licenceId',
          to: 'licences.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'licenceUnregistrations.createdBy',
          to: 'users.id'
        }
      }
    }
  }
}

export default LicenceUnregistrationModel
