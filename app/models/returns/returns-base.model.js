'use strict'

/**
 * Base class for all models based on the legacy 'returns' schema
 * @module ReturnsBaseModel
 */

const LegacyBaseModel = require('../legacy-base.model.js')

class ReturnsBaseModel extends LegacyBaseModel {
  static get schema () {
    return 'returns'
  }
}

module.exports = ReturnsBaseModel
