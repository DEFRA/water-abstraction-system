/**
 * Model for charge_version_notes (water.notes)
 * @module ChargeVersionNote
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import ChargeVersionModel from './charge-version.model.js'
import UserModel from './user.model.js'

class ChargeVersionNote extends BaseModel {
  static get tableName() {
    return 'chargeVersionNotes'
  }

  static get relationMappings() {
    return {
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: ChargeVersionModel,
        join: {
          from: 'chargeVersionNotes.id',
          to: 'chargeVersions.noteId'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'chargeVersionNotes.userId',
          to: 'users.userId'
        }
      }
    }
  }
}

export default ChargeVersionNote
