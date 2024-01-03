'use strict'

/**
 * Model for licence_roles (crm_v2.roles)
 * @module LicenceRoleModel
 */

const BaseModel = require('./base.model.js')

class LicenceRoleModel extends BaseModel {
  static get tableName () {
    return 'licenceRoles'
  }
}

module.exports = LicenceRoleModel
