'use strict'

/**
 * Model for user_verifications (crm.verification)
 * @module UserVerificationModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

/**
 * Represents an instance of a user verification record
 *
 * For reference, the user verification record is related to functionality that was added when the service was first
 * built. It sits in the old `crm` schema and was not migrated to `crm_v2` as part of the previous team's efforts to
 * replace the old legacy CRM setup.
 *
 * It is used to capture the verification of a user for a group of licences. This is part of the process of claiming a
 * licence, which allows a user to be associated with a licence and so manage it.
 *
 * Once the verification process is complete the licence_document_header record will be linked to the "company" entity
 * (licence_entity) so this verification record is not needed to manage the licence, but is solely used to manage the
 * verification process.
 */
class UserVerificationModel extends BaseModel {
  static get tableName() {
    return 'userVerifications'
  }

  static get relationMappings() {
    return {
      // The "company" entity (just a notional group of licences) that the user is claiming the licences for
      companyEntity: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-entity.model',
        join: {
          from: 'userVerifications.companyEntityId',
          to: 'licenceEntities.id'
        }
      },
      // The group of licences being claimed
      licenceDocumentHeaders: {
        relation: Model.ManyToManyRelation,
        modelClass: 'licence-document-header.model',
        join: {
          from: 'userVerifications.id',
          through: {
            from: 'userVerificationDocuments.userVerificationId',
            to: 'userVerificationDocuments.licenceDocumentHeaderId'
          },
          to: 'licenceDocumentHeaders.id'
        }
      },
      // The "individual" entity (the registered user) that is claiming the licence
      licenceEntity: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-entity.model',
        join: {
          from: 'userVerifications.licenceEntityId',
          to: 'licenceEntities.id'
        }
      }
    }
  }
}

module.exports = UserVerificationModel
