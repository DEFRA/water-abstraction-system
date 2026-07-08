/**
 * Model for mod log (water.mod_logs)
 * @module ModLogModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import ChargeVersionModel from './charge-version.model.js'
import LicenceModel from './licence.model.js'
import LicenceVersionModel from './licence-version.model.js'
import ReturnVersionModel from './return-version.model.js'

export default class ModLogModel extends BaseModel {
  static get tableName() {
    return 'modLogs'
  }

  static get relationMappings() {
    return {
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: ChargeVersionModel,
        join: {
          from: 'modLogs.chargeVersionId',
          to: 'chargeVersions.id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceModel,
        join: {
          from: 'modLogs.licenceId',
          to: 'licences.id'
        }
      },
      licenceVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceVersionModel,
        join: {
          from: 'modLogs.licenceVersionId',
          to: 'licenceVersions.id'
        }
      },
      returnVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReturnVersionModel,
        join: {
          from: 'modLogs.returnVersionId',
          to: 'returnVersions.id'
        }
      }
    }
  }
}