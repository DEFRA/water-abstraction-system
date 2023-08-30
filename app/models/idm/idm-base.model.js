'use strict'

/**
 * Base class for all models based on the legacy 'idm' schema
 * @module IDMBaseModel
 */

const LegacyBaseModel = require('../legacy-base.model.js')

class IDMBaseModel extends LegacyBaseModel {
  static get schema () {
    return 'idm'
  }
}

module.exports = IDMBaseModel
