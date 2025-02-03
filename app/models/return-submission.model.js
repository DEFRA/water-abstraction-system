'use strict'

/**
 * Model for return_submissions (returns.versions)
 * @module ReturnSubmissionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')
const { formatDateObjectToISO } = require('../lib/dates.lib.js')
const { unitNames } = require('../lib/static-lookups.lib.js')

class ReturnSubmissionModel extends BaseModel {
  static get tableName() {
    return 'returnSubmissions'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['metadata']
  }

  static get relationMappings() {
    return {
      returnLog: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'return-log.model',
        join: {
          from: 'returnSubmissions.returnLogId',
          to: 'returnLogs.id'
        }
      },
      returnSubmissionLines: {
        relation: Model.HasManyRelation,
        modelClass: 'return-submission-line.model',
        join: {
          from: 'returnSubmissions.id',
          to: 'returnSubmissionLines.returnSubmissionId'
        }
      }
    }
  }

  /**
   * Applies meter readings to return submission lines
   */
  $applyReadings() {
    const meter = this.$meter()

    if (!this.returnSubmissionLines || !meter?.readings) {
      return
    }

    for (const line of this.returnSubmissionLines) {
      const { startDate, endDate } = line
      const key = `${formatDateObjectToISO(startDate)}_${formatDateObjectToISO(endDate)}`

      const reading = meter?.readings[key]

      line.reading = reading ?? null
    }
  }

  /**
   * Returns the first meter from the return submission's metadata, or null if no meters exist.
   *
   * @returns {object|null} The first meter, or null.
   */
  $meter() {
    if (!this.metadata?.meters) {
      return null
    }

    return this.metadata.meters[0]
  }

  /**
   * Returns the method of measurement from the return submission's metadata, defaulting to 'abstractionVolumes' if none
   * is specified.
   *
   * @returns {string} The method of measurement.
   */
  $method() {
    if (!this.metadata?.method) {
      return 'abstractionVolumes'
    }

    return this.metadata.method
  }

  /**
   * Returns the unit of measurement from the return submission's metadata, defaulting to cubic metres if not specified.
   *
   * @returns {string} The unit of measurement.
   */
  $units() {
    if (!this.metadata?.units) {
      return unitNames.CUBIC_METRES
    }

    return this.metadata.units
  }
}

module.exports = ReturnSubmissionModel
