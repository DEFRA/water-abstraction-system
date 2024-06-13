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
      licenceAgreements: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-agreement.model',
        join: {
          from: 'licences.licenceRef',
          to: 'licenceAgreements.licenceRef'
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
      returnLogs: {
        relation: Model.HasManyRelation,
        modelClass: 'return-log.model',
        join: {
          from: 'licences.licenceRef',
          to: 'returnLogs.licenceRef'
        }
      },
      returnVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'return-version.model',
        join: {
          from: 'licences.id',
          to: 'returnVersions.licenceId'
        }
      },
      reviewLicences: {
        relation: Model.HasManyRelation,
        modelClass: 'review-licence.model',
        join: {
          from: 'licences.id',
          to: 'reviewLicences.licenceId'
        }
      },
      workflows: {
        relation: Model.HasManyRelation,
        modelClass: 'workflow.model',
        join: {
          from: 'licences.id',
          to: 'workflows.licenceId'
        }
      },
      permitLicence: {
        relation: Model.HasOneRelation,
        modelClass: 'permit-licence.model',
        join: {
          from: 'licences.licenceRef',
          to: 'permitLicences.licenceRef'
        }
      },
      licenceGaugingStations: {
        relation: Model.ManyToManyRelation,
        modelClass: 'gauging-station.model',
        join: {
          from: 'licences.id',
          through: {
            from: 'licenceGaugingStations.licenceId',
            to: 'licenceGaugingStations.gaugingStationId'
          },
          to: 'gaugingStations.id'
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
      },
      /**
       * registeredToAndLicenceName modifier fetches the linked `licenceDocumentHeader` which holds the licence name and
       * adds to it the registered user's email address if one is set.
       */
      registeredToAndLicenceName (query) {
        query
          .withGraphFetched('licenceDocumentHeader')
          .modifyGraph('licenceDocumentHeader', (builder) => {
            builder.select([
              'licenceDocumentHeaders.id',
              'licenceDocumentHeaders.licenceName',
              'licenceEntityRoles.role',
              'licenceEntities.name AS registeredTo'
            ])
              .leftJoin('licenceEntityRoles', function () {
                this
                  .on('licenceEntityRoles.companyEntityId', '=', 'licenceDocumentHeaders.companyEntityId')
                  .andOn('licenceEntityRoles.role', '=', Model.raw('?', ['primary_user']))
              })
              .leftJoin('licenceEntities', 'licenceEntities.id', 'licenceEntityRoles.licenceEntityId')
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

    const filteredDates = endDates.filter((endDate) => {
      return endDate.date
    })

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

  /**
   * Determine the name of the licence holder for the licence
   *
   * > We recommend adding the `licenceHolder` modifier to your query to ensure the joined records are available to
   * > determine this
   *
   * Every licence has a licence holder. They may be a company or a person (held as a 'contact' record). This
   * information is stored in 'licence document roles' and because the licence holder can change, there may be more
   * than one record.
   *
   * To get to the 'licence document roles' we have to go via the linked 'licence document' and ensure we sort by their
   * start date so that we have the 'current' licence holder. Thankfully, the `licenceHolder` query modifier deals
   * with this for us.
   *
   * Every licence is always linked to a 'company' record. But if they are also linked to a 'contact' it takes
   * precedence when determining the licence holder name.
   *
   * @returns {(string|null)} `null` if this instance does not have the additional properties needed to determine the
   * licence holder else the licence holder's name
   */
  $licenceHolder () {
    // Extract the company and contact from the last licenceDocumentRole created. It is assumed that the
    // `licenceHolder` modifier has been used to get the additional records needed for this. It also ensures in the case
    // that there is more than one that they are ordered by their start date (DESC)
    const latestLicenceDocumentRole = this?.licenceDocument?.licenceDocumentRoles[0]

    if (!latestLicenceDocumentRole) {
      return null
    }

    const { company, contact } = latestLicenceDocumentRole

    if (contact) {
      return contact.$name()
    }

    return company.name
  }

  /**
   * Determine the licence name for the licence
   *
   * > We recommend adding the `registeredToAndLicenceName` modifier to your query to ensure the joined records are
   * > available to determine this
   *
   * If set this is visible on the view licence page above the licence reference and on the legacy external view as a
   * field in the summary tab.
   *
   * The licence name is a custom name the registered user of the licence can set. So, you will only see a licence name
   * if the licence is registered to a user and they have chosen to set a name for it via the external UI.
   *
   * @returns {(string|null)} `null` if this instance does not have the additional properties needed to determine the
   * licence name else the licence's custom name
   */
  $licenceName () {
    const licenceName = this?.licenceDocumentHeader?.licenceName

    return licenceName || null
  }

  /**
   * Determine who the licence is registered to
   *
   * > We recommend adding the `registeredToAndLicenceName` modifier to your query to ensure the joined records are
   * > available to determine this
   *
   * If set this is visible on the view licence page below the licence reference.
   *
   * When an external user has an account they can add a licence via the external UI. We'll generate a letter with a
   * code which gets sent to the licence's address. Once they receive it they can enter the code in the UI and they
   * then become the registered user for it.
   *
   * @returns {(string|null)} `null` if this instance does not have the additional properties needed to determine who
   * the licence is registered to else the email of the user
   */
  $registeredTo () {
    const registeredUserName = this?.licenceDocumentHeader?.registeredTo

    return registeredUserName || null
  }
}

module.exports = LicenceModel
