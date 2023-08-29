'use strict'

/**
 * Model for company
 * @module CompanyModel
 */

const CrmV2BaseModel = require('./crm-v2-base.model.js')

class CompanyModel extends CrmV2BaseModel {
  static get tableName () {
    return 'companies'
  }

  static get idColumn () {
    return 'companyId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }
}

module.exports = CompanyModel
