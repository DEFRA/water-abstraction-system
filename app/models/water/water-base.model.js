'use strict'

/**
 * Base class for all models based on the legacy 'water' schema
 * @module WaterBaseModel
 */

const LegacyBaseModel = require('../legacy-base.model.js')

class WaterBaseModel extends LegacyBaseModel {
  static get schema () {
    return 'water'
  }
}

module.exports = WaterBaseModel
