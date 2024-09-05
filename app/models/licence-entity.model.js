'use strict'

/**
 * Model for licence_entities (crm.entity)
 * @module LicenceEntityModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

/**
 * Represents an instance of a licence entity record
 *
 * For reference, the licence entity record is related to functionality that was added when the service was first built.
 * It sits in the old `crm` schema and was not migrated to `crm_v2` as part of the previous team's efforts to replace
 * the old legacy CRM setup.
 *
 * Currently, the only reason we need it is to identify if a licence has a 'registered user'. You'll see this
 * highlighted when you view a licence.
 *
 * But the reason it is called `entity` in the `crm` schema is because it was intended to be a generic bucket of
 * 'things'. So, you'll find 4 types if you look at the raw data.
 *
 * - regime (only one record has this type and comes from the original team being pressured to create a tactical CRM for
 *   all regimes, not just water abstraction)
 * - company (this has been replaced by `crm_v2.companies`)
 * - individual (this has been replaced by `crm_v2.companies`, except for registered users which is the only reason we
 *   need to add this model)
 * - delete_me (no idea! But only one record has this type so it can be ignored)
 */
class LicenceEntityModel extends BaseModel {
  static get tableName () {
    return 'licenceEntities'
  }

  static get relationMappings () {
    return {
      licenceEntityRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-entity-role.model',
        join: {
          from: 'licenceEntities.id',
          to: 'licenceEntityRoles.licenceEntityId'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user.model',
        join: {
          from: 'licenceEntities.id',
          to: 'users.licenceEntityId'
        }
      }
    }
  }
}

module.exports = LicenceEntityModel
