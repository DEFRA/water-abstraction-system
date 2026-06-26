'use strict'

/**
 * Model for licence_unregistrations (water.licence_unregistrations)
 * @module LicenceUnregistrationModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceUnregistrationModel extends BaseModel {
  static get tableName() {
    return 'licenceUnregistrations'
  }

  static get relationMappings() {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceUnregistrations.licenceId',
          to: 'licences.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user.model',
        join: {
          from: 'licenceUnregistrations.createdBy',
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = LicenceUnregistrationModel
