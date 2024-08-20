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
}

module.exports = LicenceVersionModel
