'use strict'

/**
 * Model for charge_versions (water.charge_versions)
 * @module ChargeVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeVersionModel extends BaseModel {
  static get tableName () {
    return 'chargeVersions'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'approvedBy',
      'createdBy'
    ]
  }

  static get relationMappings () {
    return {
      billingAccount: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'billing-account.model',
        join: {
          from: 'chargeVersions.billingAccountId',
          to: 'billingAccounts.id'
        }
      },
      billRunChargeVersionYears: {
        relation: Model.HasManyRelation,
        modelClass: 'bill-run-charge-version-year.model',
        join: {
          from: 'chargeVersions.id',
          to: 'billRunChargeVersionYears.chargeVersionId'
        }
      },
      changeReason: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'change-reason.model',
        join: {
          from: 'chargeVersions.changeReasonId',
          to: 'changeReasons.id'
        }
      },
      chargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'chargeVersions.id',
          to: 'chargeReferences.chargeVersionId'
        }
      },
      chargeVersionNote: {
        relation: Model.HasOneRelation,
        modelClass: 'charge-version-note.model',
        join: {
          from: 'chargeVersions.noteId',
          to: 'chargeVersionNotes.id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'chargeVersions.licenceId',
          to: 'licences.id'
        }
      },
      modLogs: {
        relation: Model.HasManyRelation,
        modelClass: 'mod-log.model',
        join: {
          from: 'chargeVersions.id',
          to: 'modLogs.chargeVersionId'
        }
      },
      reviewChargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'review-charge-version.model',
        join: {
          from: 'chargeVersions.id',
          to: 'reviewChargeVersions.chargeVersionId'
        }
      }
    }
  }

  /**
   * Modifiers allow us to reuse logic in queries, eg. select the charge version, note, and/or all mod log records:
   *
   * return ChargeVersionModel.query()
   *   .findById(chargeVersionId)
   *   .modify('history')
   *
   * See {@link https://vincit.github.io/objection.js/recipes/modifiers.html | Modifiers} for more details
   */
  static get modifiers () {
    return {
      // history modifier fetches all the related records needed to determine history properties, for example, created
      // at, and created by from the record, plus its note, change reason, and NALD mod logs (where they exist)
      history (query) {
        query
          .select(['createdBy'])
          .withGraphFetched('modLogs')
          .modifyGraph('modLogs', (builder) => {
            builder.select([
              'id',
              'naldDate',
              'note',
              'reasonDescription',
              'userId'
            ])
              .orderBy('externalId', 'asc')
          })
          .withGraphFetched('changeReason')
          .modifyGraph('changeReason', (builder) => {
            builder.select([
              'id',
              'description'
            ])
          })
          .withGraphFetched('chargeVersionNote')
          .modifyGraph('chargeVersionNote', (builder) => {
            builder.select([
              'id',
              'note'
            ])
          })
      }
    }
  }

  /**
   * Determine the created at date of the 'source' record using history
   *
   * > We recommend adding the `history` modifier to your query to support this determination
   *
   * NALD has a concept called 'mod log'. When someone creates a new licence, charge, or return version, they can
   * provide a reason and a note, which is saved as the 'mod log'. Who created the 'mod log' and when is also captured.
   *
   * It was intended to record a history of changes to the licence.
   *
   * Unfortunately, NALD doesn't enforce it's creation. But as the NALD version records don't capture the who and when,
   * they are the best 'source' we have to determine this information for imported records.
   *
   * If there are mod logs for this record, it extracts the date from the first entry, for example, `2019-06-02`, and
   * returns it. Else, it falls back to using the return version's `createdAt` time stamp.
   *
   * > The NALD date takes priority, because all records will have a created at date. But in the case of imported
   * > records this will be when it was imported to WRLS, which can be some time after it was created in NALD.
   *
   * @returns {Date} the date the 'source' record was created
   */
  $createdAt () {
    const firstModLog = this._firstModLog()

    return firstModLog?.naldDate ?? this.createdAt
  }

  _firstModLog () {
    if (this.modLogs.length > 0) {
      return this.modLogs[0]
    }

    return null
  }

  /**
   * Determine which user created the 'source' record using history
   *
   * > We recommend adding the `history` modifier to your query to support this determination
   *
   * NALD has a concept called 'mod log'. When someone creates a new licence, charge, or return version, they can
   * provide a reason and a note, which is saved as the 'mod log'. Who created the 'mod log' and when is also captured.
   *
   * It was intended to record a history of changes to the licence.
   *
   * Unfortunately, NALD doesn't enforce it's creation. But as the NALD version records don't capture the who and when,
   * they are the best 'source' we have to determine this information for imported records.
   *
   * If a `createdBy` is populated for this version then it was created in WRLS and it is the 'source'. It extracts the
   * user name, for example, `carol.shaw@wrls.gov.uk`.
   *
   * If `createdBy` is not populated, it falls back to attempting to extract the user ID from the first mod log record,
   * for example, `JSMITH`. If one exists it is the 'source'.
   *
   * If neither `createdBy` nor any mod logs exist it will return `null`.
   *
   * @returns {string} the user name of the user that created the 'source' record, else `null` if it cannot be
   * determined
   */
  $createdBy () {
    if (this.createdBy) {
      return this.createdBy.email
    }

    const firstModLog = this._firstModLog()

    return firstModLog?.userId ?? null
  }
}

module.exports = ChargeVersionModel
