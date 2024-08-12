'use strict'

/**
 * Model for notes (water.notes)
 * @module NoteModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class NoteModel extends BaseModel {
  static get tableName () {
    return 'notes'
  }

  static get relationMappings () {
    return {
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'notes.id',
          to: 'chargeVersions.noteId'
        }
      }
    }
  }
}

module.exports = NoteModel
