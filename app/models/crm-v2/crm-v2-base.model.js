'use strict'

/**
 * Base class for all models based on the legacy 'crm_v2' schema
 * @module CrmV2BaseModel
 */

const LegacyBaseModel = require('../legacy-base.model.js')

/**
 * An issue with the way the standard implementation of the SnakeCase conversion was incorrectly handling the schema
 * name of `crmV2` by converting it to `crm_v_2` has meant that a custom SnakeCase mapper has been created so that
 * formatting is not applied to the `crm_v2` schema name.
 *
 * See `app/lib/legacy-db-snake-case-mappers.lib.js` or https://github.com/DEFRA/water-abstraction-system/pull/131 for
 * more details.
 */

class CrmV2BaseModel extends LegacyBaseModel {
  static get schema () {
    return 'crm_v2'
  }
}

module.exports = CrmV2BaseModel
