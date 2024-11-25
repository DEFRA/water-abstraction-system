'use strict'

/**
 * De-duplicates a licence by removing the record with whitespace and its related records
 * @module DeDuplicateService
 */

const { db } = require('../../../../db/db.js')
const LicenceModel = require('../../../models/licence.model.js')

/**
 * De-duplicates a licence by removing the record with whitespace and its related records
 *
 * If first matches all licences against the licence reference provided. For example, if '01/120' is the reference we
 * will match
 *
 * - '01/120'
 * - 'WA/01/120'
 * - '02/01/120/R01'
 * - ' 01/120'
 * - ' 01/120 '
 * - '01/120 '
 * - '\n01/120'
 * - '\n01/120\n'
 * - '01/120\n'
 *
 * We then use a regex to filter out any result that does not include whitespace. These are the invalid licence records
 * that need to be removed. We iterate through them (though we expect there to only ever be 1 result) and first delete
 * all related records before then deleting the main licence record.
 *
 * We've opted to use {@link https://knexjs.org/guide/raw.html | Knex.raw()} rather than
 * {@link https://vincit.github.io/objection.js/ | Objection.js} because not all the tables referenced have models. So,
 * rather than switch between different ways of querying we stick to one for the removal.
 *
 * @param {string} licenceRef - Reference for the licence with a duplicate record
 *
 * @returns {Promise} the service does not resolve to a value
 */
async function go(licenceRef) {
  const invalidLicences = await _determineInvalidLicences(licenceRef)

  // NOTE: In theory there could be more than one 'bad' licence for the matching licence reference! But mainly we do
  // this as a loop because it is an easy way to deal with the fact we have an array.
  for (const invalidLicence of invalidLicences) {
    const { id: licenceId, licenceRef: invalidLicenceRef } = invalidLicence

    // NOTE: Order is important. Some tables have to be cleared before others. So resist trying to make the calls
    // alphabetical!
    await _documentRoles(invalidLicenceRef)
    await _documents(invalidLicenceRef)
    await _documentHeaders(invalidLicenceRef)
    await _permitLicences(invalidLicenceRef)
    await _returns(invalidLicenceRef)
    await _licenceVersionPurposeConditions(licenceId)
    await _licenceVersionPurposes(licenceId)
    await _licenceVersions(licenceId)
    await _returnRequirementPurposes(licenceId)
    await _returnRequirements(licenceId)
    await _returnVersions(licenceId)
    await _licences(licenceId)
  }
}

async function _determineInvalidLicences(licenceRef) {
  const licences = await LicenceModel.query().select(['id', 'licenceRef']).whereILike('licenceRef', `%${licenceRef}%`)

  // NOTE: Match any string which has whitespace at the start or the end of the string
  // ^  asserts position at start of the string
  // \s matches any whitespace character
  const whitespaceAtStartRegex = /^\s/
  // \s matches any whitespace character
  // $  asserts position at end of the string
  const whitespaceAtEndRegex = /\s$/

  const invalidLicences = licences.filter((licence) => {
    return whitespaceAtStartRegex.test(licence.licenceRef) || whitespaceAtEndRegex.test(licence.licenceRef)
  })

  return invalidLicences
}

async function _documentHeaders(licenceRef) {
  return db.raw(
    `
  DELETE FROM crm.document_header WHERE system_external_id = ?;
  `,
    licenceRef
  )
}

async function _documentRoles(licenceRef) {
  return db.raw(
    `
  DELETE FROM "crm_v2"."document_roles" WHERE document_id IN (
    SELECT document_id FROM "crm_v2"."documents" WHERE document_ref = ?
  );
  `,
    licenceRef
  )
}

async function _documents(licenceRef) {
  return db.raw(
    `
  DELETE FROM "crm_v2"."documents" WHERE document_ref = ?;
  `,
    licenceRef
  )
}

async function _licences(licenceId) {
  return db.raw(
    `
  DELETE FROM water.licences WHERE licence_id = ?;
  `,
    licenceId
  )
}

async function _licenceVersionPurposeConditions(licenceId) {
  return db.raw(
    `
  DELETE FROM water.licence_version_purpose_conditions WHERE licence_version_purpose_id IN (
    SELECT licence_version_purpose_id FROM water.licence_version_purposes WHERE licence_version_id IN (
      SELECT licence_version_id FROM water.licence_versions WHERE licence_id = ?
    )
  );
  `,
    licenceId
  )
}

async function _licenceVersionPurposes(licenceId) {
  return db.raw(
    `
  DELETE FROM water.licence_version_purposes WHERE licence_version_id IN (
    SELECT licence_version_id FROM water.licence_versions WHERE licence_id = ?
  );
  `,
    licenceId
  )
}

async function _licenceVersions(licenceId) {
  return db.raw(
    `
  DELETE FROM water.licence_versions WHERE licence_id = ?;
  `,
    licenceId
  )
}

async function _permitLicences(licenceRef) {
  return db.raw(
    `
  DELETE FROM permit.licence WHERE licence_ref = ?;
  `,
    licenceRef
  )
}

async function _returnRequirementPurposes(licenceId) {
  return db.raw(
    `
  DELETE FROM water.return_requirement_purposes WHERE return_requirement_id IN (
    SELECT return_requirement_id  FROM water.return_requirements WHERE return_version_id IN (
      SELECT return_version_id FROM water.return_versions WHERE licence_id = ?
    )
  );
  `,
    licenceId
  )
}

async function _returnRequirements(licenceId) {
  return db.raw(
    `
  DELETE FROM water.return_requirements WHERE return_version_id IN (
    SELECT return_version_id FROM water.return_versions WHERE licence_id = ?
  );
  `,
    licenceId
  )
}

async function _returns(licenceRef) {
  return db.raw(
    `
  DELETE FROM "returns"."returns" WHERE licence_ref = ?;
  `,
    licenceRef
  )
}

async function _returnVersions(licenceId) {
  return db.raw(
    `
  DELETE FROM water.return_versions WHERE licence_id = ?;
  `,
    licenceId
  )
}

module.exports = {
  go
}
