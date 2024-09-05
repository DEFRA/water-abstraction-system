'use strict'

/**
 * Model for charge_version_notes (water.notes)
 * @module ChargeVersionNote
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeVersionNote extends BaseModel {
  static get tableName () {
    return 'chargeVersionNotes'
  }

  static get relationMappings () {
    return {
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'chargeVersionNotes.id',
          to: 'chargeVersions.noteId'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user.model',
        join: {
          from: 'chargeVersionNotes.userId',
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = ChargeVersionNote
