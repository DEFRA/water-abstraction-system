'use strict'

/**
 * Model for licence_end_date_changes (water.licence_end_date_changes)
 * @module LicenceEndDateChangeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceEndDateChangeModel extends BaseModel {
  static get tableName() {
    return 'licenceEndDateChanges'
  }

  static get relationMappings() {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceEndDateChanges.licenceId',
          to: 'licences.id'
        }
      }
    }
  }
}

module.exports = LicenceEndDateChangeModel
