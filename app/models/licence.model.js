'use strict'

/**
 * Model for licences (water.licences)
 * @module LicenceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceModel extends BaseModel {
  static get tableName () {
    return 'licences'
  }

  static get relationMappings () {
    return {
      billLicences: {
        relation: Model.HasManyRelation,
        modelClass: 'bill-licence.model',
        join: {
          from: 'licences.id',
          to: 'billLicences.licenceId'
        }
      },
      chargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'licences.id',
          to: 'chargeVersions.licenceId'
        }
      },
      licenceDocument: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-document.model',
        join: {
          from: 'licences.licenceRef',
          to: 'licenceDocuments.licenceRef'
        }
      },
      licenceDocumentHeader: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-document-header.model',
        join: {
          from: 'licences.licenceRef',
          to: 'licenceDocumentHeaders.licenceRef'
        }
      },
      licenceVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-version.model',
        join: {
          from: 'licences.id',
          to: 'licenceVersions.licenceId'
        }
      },
      region: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'region.model',
        join: {
          from: 'licences.regionId',
          to: 'regions.id'
        }
      },
      workflows: {
        relation: Model.HasManyRelation,
        modelClass: 'workflow.model',
        join: {
          from: 'licences.id',
          to: 'workflows.licenceId'
        }
      }
    }
  }

  /**
   * Modifiers allow us to reuse logic in queries, eg. select the licence and everything to get the licence holder:
   *
   * return LicenceModel.query()
   *   .findById(licenceId)
   *   .modify('licenceHolder')
   *
   * See {@link https://vincit.github.io/objection.js/recipes/modifiers.html | Modifiers} for more details
   */
  static get modifiers () {
    return {
      /**
       * licenceHolder modifier fetches all the joined records needed to identify the licence holder
       */
      licenceHolder (query) {
        query
          .withGraphFetched('licenceDocument')
          .modifyGraph('licenceDocument', (builder) => {
            builder.select([
              'id'
            ])
          })
          .withGraphFetched('licenceDocument.licenceDocumentRoles')
          .modifyGraph('licenceDocument.licenceDocumentRoles', (builder) => {
            builder
              .select([
                'licenceDocumentRoles.id'
              ])
              .innerJoinRelated('licenceRole')
              .where('licenceRole.name', 'licenceHolder')
              .orderBy('licenceDocumentRoles.startDate', 'desc')
          })
          .withGraphFetched('licenceDocument.licenceDocumentRoles.company')
          .modifyGraph('licenceDocument.licenceDocumentRoles.company', (builder) => {
            builder.select([
              'id',
              'name',
              'type'
            ])
          })
          .withGraphFetched('licenceDocument.licenceDocumentRoles.contact')
          .modifyGraph('licenceDocument.licenceDocumentRoles.contact', (builder) => {
            builder.select([
              'id',
              'contactType',
              'dataSource',
              'department',
              'firstName',
              'initials',
              'lastName',
              'middleInitials',
              'salutation',
              'suffix'
            ])
          })
      }
    }
  }

  /**
   * Determine the 'end' date for the licence
   *
   * A licence can 'end' for 3 reasons:
   *
   * - because it is _revoked_
   * - because it is _lapsed_
   * - because it is _expired_
   *
   * The previous delivery team chose to encode these as 3 separate date fields on the licence record. So, if a field is
   * populated it means the licence 'ends' for that reason on that day.
   *
   * More than one of these fields may be populated. For example, a licence was due to expire on 2023-08-10 but was then
   * revoked on 2022-04-27. So, to determine the reason you need to select the _earliest_ date.
   *
   * But are examples where 2 of the fields might be populated with the same date (and 1 licence where all 3 have the
   * same date!) If more than one date field is populated and they hold the earliest date value then we select based on
   * priority; _revoked_ -> _lapsed_ -> _expired_.
   *
   * @returns `null` if no 'end' dates are set else an object containing the date, priority and reason for either the
   * earliest or highest priority end date
   */
  $ends () {
    const endDates = [
      { date: this.revokedDate, priority: 1, reason: 'revoked' },
      { date: this.lapsedDate, priority: 2, reason: 'lapsed' },
      { date: this.expiredDate, priority: 3, reason: 'expired' }
    ]

    const filteredDates = endDates.filter((endDate) => endDate.date)

    if (filteredDates.length === 0) {
      return null
    }

    // NOTE: For date comparisons you cannot use !== with just the date values. Using < or > will coerce the values into
    // numbers for comparison. But equality operators are checking that the two operands are referring to the same
    // Object. So, where we have matching dates and expect !== to return 'false' we get 'true' instead
    // Thanks to https://stackoverflow.com/a/493018/6117745 for explaining the problem and providing the solution
    filteredDates.sort((firstDate, secondDate) => {
      if (firstDate.date.getTime() !== secondDate.date.getTime()) {
        if (firstDate.date.getTime() < secondDate.date.getTime()) {
          return -1
        }

        return 1
      }

      if (firstDate.priority < secondDate.priority) {
        return -1
      }

      return 1
    })

    return filteredDates[0]
  }
}

module.exports = LicenceModel
