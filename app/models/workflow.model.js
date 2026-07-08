/**
 * Model for workflows (water.charge_version_workflows)
 * @module WorkflowModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceModel from './licence.model.js'

export default class WorkflowModel extends BaseModel {
  static get tableName() {
    return 'workflows'
  }

  static get relationMappings() {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceModel,
        join: {
          from: 'workflows.licenceId',
          to: 'licences.id'
        }
      }
    }
  }
}