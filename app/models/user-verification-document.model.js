'use strict'

/**
 * Model for user_verification_documents (crm.verification_documents)
 * @module UserVerificationDocumentModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

/**
 * Represents an instance of a user verification document record
 *
 * For reference, the user verification document record is related to functionality that was added when the service was
 * first built. It sits in the old `crm` schema and was not migrated to `crm_v2` as part of the previous team's efforts
 * to replace the old legacy CRM setup.
 *
 * It is used to capture the group of licences that a user is trying to claim. This is part of the process of claiming a
 * licence, which allows a user to be associated with a licence and so manage it.
 *
 * The user verification document table is just a many-to-many join table between user verification and licence document
 * header.
 *
 * Once the verification process is complete the licence_document_header record will be linked to the "company" entity
 * (licence_entity) so this verification document record is not needed to manage the licence, but is solely used to
 * manage the verification process.
 *
 * Fun fact: The first time a user initiates the process of claiming licences, the (arbitrary) first licence in the list
 * is used to determine the name of the "company" entity (licence_entity) that is created to represent the group of
 * licences being claimed. It uses the `Name` attribute from the licence document header `metadata` field for this name.
 * The `Name` attribute is the name of the _current_ licence holder - if it is held by an organisation it will usually
 * be the organisation's name, but if it is held by an individual it will be the individual's surname.
 *
 * Thereafter, whenever the user claims more licences, they will be associated with that "company" entity.
 */
class UserVerificationDocumentModel extends BaseModel {
  static get tableName() {
    return 'userVerificationDocuments'
  }

  static get relationMappings() {
    return {
      userVerification: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user-verification.model',
        join: {
          from: 'userVerificationDocuments.userVerificationId',
          to: 'userVerifications.id'
        }
      },
      licenceDocumentHeader: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-document-header.model',
        join: {
          from: 'userVerificationDocuments.licenceDocumentHeaderId',
          to: 'licenceDocumentHeaders.id'
        }
      }
    }
  }
}

module.exports = UserVerificationDocumentModel
