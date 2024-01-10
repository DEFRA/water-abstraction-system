'use strict'

/**
 * Model for licence_roles (crm_v2.roles)
 * @module LicenceRoleModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceRoleModel extends BaseModel {
  static get tableName () {
    return 'licenceRoles'
  }

  static get relationMappings () {
    return {
      licenceDocumentRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-document-role.model',
        join: {
          from: 'licenceRoles.id',
          to: 'licenceDocumentRoles.licenceRoleId'
        }
      }
    }
  }
}

module.exports = LicenceRoleModel
