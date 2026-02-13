'use strict'

/**
 * Model for licence_entity_roles (crm.entity_roles)
 * @module LicenceEntityRoleModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

/**
 * Represents an instance of a licence entity role record
 *
 * For reference, the licence entity role record is related to functionality that was added when the service was first
 * built. It sits in the old `crm` schema and was not migrated to `crm_v2` as part of the previous team's efforts to
 * replace the old legacy CRM setup.
 *
 * We need it to identify the 'registered users' for licences. You'll see the registered user highlighted when you view
 * a licence and the list of associated "companies" and licences when viewing an external user.
 *
 * Through it we can identify which 'entities' have which roles for licences.
 */
class LicenceEntityRoleModel extends BaseModel {
  static get tableName() {
    return 'licenceEntityRoles'
  }

  static get relationMappings() {
    return {
      companyEntity: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-entity.model',
        join: {
          from: 'licenceEntityRoles.companyEntityId',
          to: 'licenceEntities.id'
        }
      },
      licenceEntity: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-entity.model',
        join: {
          from: 'licenceEntityRoles.licenceEntityId',
          to: 'licenceEntities.id'
        }
      },
      regimeEntity: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-entity.model',
        join: {
          from: 'licenceEntityRoles.regimeEntityId',
          to: 'licenceEntities.id'
        }
      }
    }
  }
}

module.exports = LicenceEntityRoleModel
