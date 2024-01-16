'use strict'

/**
 * Model for licences (water.licences)
 * @module LicenceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceModel extends BaseModel {
  static get tableName () {
    return 'licences'
  }

  static get relationMappings () {
    return {
      billLicences: {
        relation: Model.HasManyRelation,
        modelClass: 'bill-licence.model',
        join: {
          from: 'licences.id',
          to: 'billLicences.licenceId'
        }
      },
      chargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'licences.id',
          to: 'chargeVersions.licenceId'
        }
      },
      licenceDocument: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-document.model',
        join: {
          from: 'licences.licenceRef',
          to: 'licenceDocuments.licenceRef'
        }
      },
      licenceDocumentHeader: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-document-header.model',
        join: {
          from: 'licences.licenceRef',
          to: 'licenceDocumentHeaders.licenceRef'
        }
      },
      licenceVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-version.model',
        join: {
          from: 'licences.id',
          to: 'licenceVersions.licenceId'
        }
      },
      region: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'region.model',
        join: {
          from: 'licences.regionId',
          to: 'regions.id'
        }
      },
      workflows: {
        relation: Model.HasManyRelation,
        modelClass: 'workflow.model',
        join: {
          from: 'licences.id',
          to: 'workflows.licenceId'
        }
      }
    }
  }
}

module.exports = LicenceModel
