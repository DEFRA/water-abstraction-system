'use strict'

/**
 * Model for licence_supplementary_years
 * @module LicenceSupplementaryYearModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceSupplementaryYearModel extends BaseModel {
  static get tableName () {
    return 'licenceSupplementaryYears'
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceSupplementaryYears.licenceId',
          to: 'licences.id'
        }
      },
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill-run.model',
        join: {
          from: 'licenceSupplementaryYears.billRunId',
          to: 'billRuns.id'
        }
      }
    }
  }
}

module.exports = LicenceSupplementaryYearModel
