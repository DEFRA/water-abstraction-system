'use strict'

/**
 * Model for review_charge_versions
 * @module ReviewChargeVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')
const { formatLongDate } = require('../presenters/base.presenter.js')

class ReviewChargeVersionModel extends BaseModel {
  static get tableName () {
    return 'reviewChargeVersions'
  }

  static get relationMappings () {
    return {
      reviewLicence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'review-licence.model',
        join: {
          from: 'reviewChargeVersions.reviewLicenceId',
          to: 'reviewLicences.id'
        }
      },
      reviewChargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: 'review-charge-reference.model',
        join: {
          from: 'reviewChargeVersions.id',
          to: 'reviewChargeReferences.reviewChargeVersionId'
        }
      },
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'reviewChargeVersions.chargeVersionId',
          to: 'chargeVersions.id'
        }
      }
    }
  }

  /**
   * Formats the charge period into its string variant, for example, '1 April 2023 to 10 October 2023'
   *
   * @returns {string} The charge period formatted as a 'DD MMMM YYYY to DD MMMM YYYY' string
   */
  $formatChargePeriod () {
    const startDate = this.chargePeriodStartDate
    const endDate = this.chargePeriodEndDate

    return `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`
  }
}

module.exports = ReviewChargeVersionModel
