'use strict'

/**
 * Model for licence_end_date_changes (water.licence_end_date_changes)
 * @module LicenceEndDateChangeModel
 */

const BaseModel = require('./base.model.js')

class LicenceEndDateChangeModel extends BaseModel {
  static get tableName() {
    return 'licenceEndDateChanges'
  }
}

module.exports = LicenceEndDateChangeModel
