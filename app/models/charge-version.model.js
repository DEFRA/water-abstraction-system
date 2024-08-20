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
}

module.exports = ChargeVersionModel
