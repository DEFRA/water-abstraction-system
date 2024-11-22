'use strict'

/**
 * Model for return_versions (water.return_versions)
 * @module ReturnVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnVersionModel extends BaseModel {
  static get tableName() {
    return 'returnVersions'
  }

  static get relationMappings() {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'returnVersions.licenceId',
          to: 'licences.id'
        }
      },
      modLogs: {
        relation: Model.HasManyRelation,
        modelClass: 'mod-log.model',
        join: {
          from: 'returnVersions.id',
          to: 'modLogs.returnVersionId'
        }
      },
      returnRequirements: {
        relation: Model.HasManyRelation,
        modelClass: 'return-requirement.model',
        join: {
          from: 'returnVersions.id',
          to: 'returnRequirements.returnVersionId'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user.model',
        join: {
          from: 'returnVersions.createdBy',
          to: 'users.id'
        }
      }
    }
  }

  /**
   * Modifiers allow us to reuse logic in queries, eg. select the return version, user that created it, and/or all mod
   * log records:
   *
   * ```javascript
   * return ReturnVersionModel.query()
   *   .findById(returnVersionId)
   *   .modify('history')
   * ```
   *
   * See {@link https://vincit.github.io/objection.js/recipes/modifiers.html | Modifiers} for more details
   *
   * @returns {object} an object defining modifier functions for this model
   */
  static get modifiers() {
    return {
      // history modifier fetches all the related records needed to determine history properties, for example, created
      // at, created by, and notes from the record, its user, and its NALD mod logs (where they exist)
      history(query) {
        query
          .select(['createdAt', 'createdBy', 'notes', 'reason'])
          .withGraphFetched('modLogs')
          .modifyGraph('modLogs', (builder) => {
            builder.select(['id', 'naldDate', 'note', 'reasonDescription', 'userId']).orderBy('externalId', 'asc')
          })
          .withGraphFetched('user')
          .modifyGraph('user', (builder) => {
            builder.select(['id', 'username'])
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
  $createdAt() {
    const firstModLog = this._firstModLog()

    return firstModLog?.naldDate ?? this.createdAt
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
   * If a user record exists for this version then it was created in WRLS and it is the 'source'. It extracts the user
   * name, for example, `carol.shaw@wrls.gov.uk`.
   *
   * If a user record doesn't exist, it falls back to attempting to extract the user ID from the first mod log record,
   * for example, `JSMITH`. If one exists it is the 'source'.
   *
   * If neither a user nor any mod logs exist it will return `null`.
   *
   * @returns {string} the user name of the user that created the 'source' record, else `null` if it cannot be
   * determined
   */
  $createdBy() {
    if (this.user) {
      return this.user.username
    }

    const firstModLog = this._firstModLog()

    return firstModLog?.userId ?? null
  }

  /**
   * Determine the notes for the record using its history
   *
   * > We recommend adding the `history` modifier to your query to support this determination
   *
   * NALD has a concept called 'mod log'. When someone creates a new licence, charge, or return version, they can
   * provide a reason and a note, which is saved as the 'mod log'. Who created the 'mod log' and when is also captured.
   *
   * It was intended to record a history of changes to the licence.
   *
   * In NALD a return version can have multiple mod logs, each with their own note. NALD also allows users to enter a
   * note against each return requirement linked to the return version.
   *
   * In WRLS (when we takeover from NALD) only a single note is captured against the return version.
   *
   * Till we takeover, the import job for NALD return versions extracts then concatenates the return requirement notes
   * and saves them to the return version's `notes` field.
   *
   * In short, for imported records, the mod log notes take precedence then whatever note was generated during import.
   * Records created directly in WRLS will just have the single note and no mod log records.
   *
   * @returns {string[]} an array of all the notes in ascending date order taken from the record's history
   */
  $notes() {
    const notes = []

    for (const modLog of this.modLogs) {
      if (modLog.note) {
        notes.push(modLog.note)
      }
    }

    if (this.notes) {
      notes.push(this.notes)
    }

    return notes
  }

  /**
   * Determine the reason the 'source' record was created using history
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
   * If the record has a reason, either it was created in WRLS or we have mapped the NALD 'source' reason to a WRLS one.
   * The version record is the 'source'.
   *
   * If a reason doesn't exist, it falls back to attempting to extract the reason description from the first mod log
   * record, for example, `Record Loaded During Migration`. If one exists it is the 'source'.
   *
   * If neither 'source' records have a reason then it returns `null`
   *
   * @returns {string} the reason the 'source' record was created, else `null` if it cannot be determined
   */
  $reason() {
    if (this.reason) {
      return this.reason
    }

    const firstModLog = this._firstModLog()

    return firstModLog?.reasonDescription ?? null
  }

  _firstModLog() {
    if (this.modLogs.length > 0) {
      return this.modLogs[0]
    }

    return null
  }
}

module.exports = ReturnVersionModel
