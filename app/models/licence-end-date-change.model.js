/**
 * Model for licence_end_date_changes (water.licence_end_date_changes)
 * @module LicenceEndDateChangeModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceModel from './licence.model.js'

export default class LicenceEndDateChangeModel extends BaseModel {
  static get tableName() {
    return 'licenceEndDateChanges'
  }

  static get relationMappings() {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceModel,
        join: {
          from: 'licenceEndDateChanges.licenceId',
          to: 'licences.id'
        }
      }
    }
  }
}