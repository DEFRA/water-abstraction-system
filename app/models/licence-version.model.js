'use strict'

/**
 * Model for licence_versions (water.licence_versions)
 * @module LicenceVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionModel extends BaseModel {
  static get tableName () {
    return 'licenceVersions'
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceVersions.licenceId',
          to: 'licences.id'
        }
      },
      licenceVersionPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-version-purpose.model',
        join: {
          from: 'licenceVersions.id',
          to: 'licenceVersionPurposes.licenceVersionId'
        }
      },
      modLogs: {
        relation: Model.HasManyRelation,
        modelClass: 'mod-log.model',
        join: {
          from: 'licenceVersions.id',
          to: 'modLogs.licenceVersionId'
        }
      },
      purposes: {
        relation: Model.ManyToManyRelation,
        modelClass: 'purpose.model',
        join: {
          from: 'licenceVersions.id',
          through: {
            from: 'licenceVersionPurposes.licenceVersionId',
            to: 'licenceVersionPurposes.purposeId'
          },
          to: 'purposes.id'
        }
      }
    }
  }

  /**
   * Modifiers allow us to reuse logic in queries, eg. select the licence version and all mod log records:
   *
   * return LicenceVersionModel.query()
   *   .findById(licenceVersionId)
   *   .modify('history')
   *
   * See {@link https://vincit.github.io/objection.js/recipes/modifiers.html | Modifiers} for more details
   */
  static get modifiers () {
    return {
      // history modifier fetches all the related records needed to determine history properties, for example, created
      // at, created by, and notes from the record and its NALD mod logs (where they exist)
      history (query) {
        query
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
      }
    }
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
   * Licence versions are not managed in WRLS, so we do not capture a `created_by` value. The only source for this is
   * the mod logs.
   *
   * If mod logs exist it extracts the user ID from the first mod log record, for example, `JSMITH`. If one exists it is
   * the 'source'.
   *
   * If no mod logs exist it will return `null`.
   *
   * @returns {string} the user name of the user that created the 'source' record, else `null` if it cannot be
   * determined
   */
  $createdBy () {
    const firstModLog = this._firstModLog()

    return firstModLog?.userId ?? null
  }

  _firstModLog () {
    if (this.modLogs.length > 0) {
      return this.modLogs[0]
    }

    return null
  }
}

module.exports = LicenceVersionModel
