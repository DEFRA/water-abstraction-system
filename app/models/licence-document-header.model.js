'use strict'

/**
 * Model for licence_document_headers (crm.document_header)
 * @module LicenceDocumentHeaderModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

/**
 * Represents an instance of a licence document header record
 *
 * For reference, the licence document header record is a 'nothing' record! It doesn't hold anything not already stored
 * in other licence tables. We only need to obtain the licence holder name which matches what the legacy UI displays.
 *
 * We think the reason for the table being there is because of the original ambition to have a generic permit
 * repository that could be used for all types of permits. Along with that a 'tactical' CRM that interfaced with the
 * permit repository was built. Though the permit repository referred to them as licences, the CRM chose to refer to
 * them as 'documents' hence the `crm.document_header` table.
 *
 * The previous team then tried to refactor the CRM schema but never completed it. Hence we have the `crm_v2` schema
 * and more licence duplication. Finally, at a later date the previous team then opted to create a `licences` table in
 * the `water` schema we think to support charging.
 *
 * So, if you see the phrase 'Document' you can assume the instance is one of these older copies of a licence.
 * `water.licences` is the primary licence record. But we often have to dip into this older tables for other bits of
 * information, for example, the licence holder name currently displayed in the legacy UI. This is why we have models
 * like this one.
 *
 * Welcome to dealing with the legacy database schema! ¯\_(ツ)_/¯
 */
class LicenceDocumentHeaderModel extends BaseModel {
  static get tableName() {
    return 'licenceDocumentHeaders'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['metadata']
  }

  static get relationMappings() {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceDocumentHeaders.licenceRef',
          to: 'licences.licenceRef'
        }
      },
      licenceEntityRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-entity-role.model',
        join: {
          from: 'licenceDocumentHeaders.companyEntityId',
          to: 'licenceEntityRoles.companyEntityId'
        }
      }
    }
  }
}

module.exports = LicenceDocumentHeaderModel
