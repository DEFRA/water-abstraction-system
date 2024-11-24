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
 * Currently, the only reason we need it is to identify if a licence has a 'registered user'. You'll see this
 * highlighted when you view a licence.
 *
 * From it we can identify the 'entity' which has the role of primary user.
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
      licenceDocumentHeader: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-document-header.model',
        join: {
          from: 'licenceEntityRoles.companyEntityId',
          to: 'licenceDocumentHeaders.companyEntityId'
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
