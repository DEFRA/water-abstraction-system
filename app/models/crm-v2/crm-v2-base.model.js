'use strict'

/**
 * Base class for all models based on the legacy 'crm_v2' schema
 * @module CrmV2BaseModel
 */

const LegacyBaseModel = require('../legacy-base.model.js')

class CrmV2BaseModel extends LegacyBaseModel {
  static get schema () {
    return 'crmV2'
  }
}

module.exports = CrmV2BaseModel
