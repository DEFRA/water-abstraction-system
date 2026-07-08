/**
 * Model for regions (water.regions)
 * @module RegionModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import BillRunModel from './bill-run.model.js'
import CompanyModel from './company.model.js'
import LicenceModel from './licence.model.js'

export default class RegionModel extends BaseModel {
  static get tableName() {
    return 'regions'
  }

  static get relationMappings() {
    return {
      billRuns: {
        relation: Model.HasManyRelation,
        modelClass: BillRunModel,
        join: {
          from: 'regions.id',
          to: 'billRuns.regionId'
        }
      },
      companies: {
        relation: Model.HasManyRelation,
        modelClass: CompanyModel,
        join: {
          from: 'regions.id',
          to: 'companies.regionId'
        }
      },
      licences: {
        relation: Model.HasManyRelation,
        modelClass: LicenceModel,
        join: {
          from: 'regions.id',
          to: 'licences.regionId'
        }
      }
    }
  }
}