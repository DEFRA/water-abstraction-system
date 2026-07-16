/**
 * @module Generators
 */

import crypto from 'crypto'

import { formatDateObjectToISO } from '../../app/lib/dates.lib.js'
import { generateNoticeReferenceCode, generateRandomInteger, generateUUID } from '../../app/lib/general.lib.js'

export { generateNoticeReferenceCode, generateRandomInteger, generateUUID }

const VERIFICATION_CODE_CHARACTERS = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXY'
const VERIFICATION_CODE_LENGTH = 5

/**
 * Generates a random account number
 *
 * The account number is in the format 'T########A', where '#' is a digit.
 *
 * @returns {string} - The generated account number
 */
export function generateAccountNumber() {
  const numbering = generateRandomInteger(10000000, 99999999)

  return `T${numbering}A`
}

/**
 * Generate an address external id
 *
 * This is built from NALD import data using the region code and address id
 *
 * @returns {string} - A random external id
 */
export function generateAddressExternalId() {
  const regionCode = generateRandomInteger(1, 9)
  const addressId = generateRandomInteger(100, 99998)

  return `${regionCode}:${addressId}`
}

/**
 * Generate a company external id
 *
 * This is built from NALD import data using the region code and party id
 *
 * @returns {string} - A random external id
 */
export function generateCompanyExternalId() {
  const regionCode = generateRandomInteger(1, 9)
  const partyId = generateRandomInteger(100, 9999998)

  return `${regionCode}:${partyId}`
}

/**
 * Generate a company number
 *
 * @returns {int} - A random company number
 */
export function generateCompanyNumber() {
  return generateRandomInteger(1000000, 9999999).toString()
}

/**
 * Creates an MD5 hash of contact name and address to be used for comparing 'contacts'
 *
 * @param {string} contactName - The contact name to be used with the address
 * @param {object} address - The address (lines 1 to 4 plus postcode and country) to be converted to a hash
 *
 * @returns {string} - The md5 'hash ID' of the contact name and address
 */
export function generateContactHashId(contactName, address) {
  const addressLine1 = address.addressLine1
  const addressLine2 = address.addressLine2 ?? ''
  const addressLine3 = address.addressLine3 ?? ''
  const addressLine4 = address.addressLine4
  const postcode = address.postcode ?? ''
  const country = address.country ?? ''

  const combinedString = `${contactName}${addressLine1}${addressLine2}${addressLine3}${addressLine4}${postcode}${country}`

  return crypto.createHash('md5').update(combinedString).digest('hex')
}

/**
 * Returns a randomly generated licence reference
 *
 * @returns {string} - A randomly generated licence reference
 */
export function generateLicenceRef() {
  const secondPart = generateRandomInteger(10, 99)
  const thirdPart = generateRandomInteger(10, 99)
  const fourthPart = generateRandomInteger(1000, 9999)

  return `01/${secondPart}/${thirdPart}/${fourthPart}`
}

/**
 * Returns a randomly generated externalId for a licence version
 *
 * @returns {string} - A randomly generated externalId
 */
export function generateLicenceVersionExternalId() {
  return `${generateRandomInteger(0, 9)}:${generateRandomInteger(10000, 99999)}:${generateRandomInteger(1, 100)}:0`
}

/**
 * Returns a randomly generated licence version purpose external id
 *
 * @returns {string} - A randomly generated external id
 */
export function generateLicenceVersionPurposeExternalId() {
  return `${generateRandomInteger(0, 9)}:${generateRandomInteger(10000, 99999)}`
}

/**
 * Returns a randomly generated licence version purpose point external ID (9:100:1)
 *
 * Combines IDs found in `NALD_ABS_PURP_POINTS` which is the basis for licence version purpose points.
 *
 * - `[region code]:[licence version purpose ID]:[point ID]` - all values are NALD IDs
 *
 * @returns {string} - A randomly generated licence version purpose point external ID
 */
export function generateLicenceVersionPurposePointExternalId() {
  const naldPointId = generateNaldPointId()

  return `9:${generateRandomInteger(100, 99999)}:${naldPointId}`
}

/**
 * Generates a random name
 *
 * @returns {string} a random name in the format [random UUID]@example.co.uk
 */
export function generateName() {
  return `${generateUUID()}@example.co.uk`
}

/**
 * Returns a randomly generated NALD point ID (55944)
 *
 * @returns {string} - A randomly generated point ID
 */
export function generateNaldPointId() {
  return generateRandomInteger(1, 99999)
}

/**
 * Returns a randomly generated National Grid Reference NGR (TL 5143 7153)
 *
 * @returns {string} - A randomly National Grid Reference NGR
 */
export function generateNationalGridReference() {
  // NOTE: These are taken from https://en.wikipedia.org/wiki/Ordnance_Survey_National_Grid and are the 100KM
  // square references that cover the majority of the UK (sorry far North!)
  const codes = ['SD', 'SE', 'SJ', 'SK', 'SO', 'SP', 'ST', 'SU', 'SY', 'SZ', 'TA', 'TF', 'TL', 'TQ', 'TV', 'TG', 'TM']

  return `${codes[generateRandomInteger(0, 16)]} ${generateRandomInteger(100, 999)} ${generateRandomInteger(100, 999)}`
}

/**
 * Generates a return requirement reference
 *
 * @returns {number}
 */
export function generateReference() {
  return generateRandomInteger(10000000, 99999999)
}

/**
 * Generates a NALD pattern external ID (e.g. 9:10001)
 *
 * The pattern is: [region code]:[NALD ID]
 *
 * @param {number} [regionCode] - The region code to use, if not provided a random one is used
 *
 * @returns {string} The generated external ID
 */
export function generateRegionNaldPatternExternalId(regionCode = null) {
  const regionCodeToUse = regionCode ?? generateRandomInteger(1, 9)

  return `${regionCodeToUse}:${generateRandomInteger(100, 99999)}`
}

/**
 * Returns a randomly generated return log Id
 *
 * Unlike other tables, the previous team opted to generate a unique ID based on properties of the return log including
 * start and end dates, version and references.
 *
 * So, in order to replicate that we have this helper method, that defaults some of those values, and randomises others
 * in order to generate a unique return log ID.
 *
 * If you have known values, for example, the licence reference they can be passed to this helper and it will
 * incorporate them into the ID.
 *
 * @param {string} [startDate] - the start date as a string, for example '2022-04-01'
 * @param {string} [endDate] - the end date as a string, for example '2023-03-31'
 * @param {number} [version] - the version number to use, for example 1
 * @param {string} [licenceRef] - the licence reference to use
 * @param {string} [returnReference] - the return requirement reference to use
 *
 * @returns {string} the generated return log ID
 */
export function generateReturnId(
  startDate = new Date('2022-04-01'),
  endDate = new Date('2023-03-31'),
  version = 1,
  licenceRef = null,
  returnReference = null
) {
  if (!licenceRef) {
    licenceRef = generateLicenceRef()
  }

  if (!returnReference) {
    returnReference = generateReference()
  }

  return `v${version}:1:${licenceRef}:${returnReference}:${formatDateObjectToISO(startDate)}:${formatDateObjectToISO(endDate)}`
}

/**
 * Returns a randomly generated return requirement point external ID (9:100:1)
 *
 * Combines IDs found in `NALD_RET_FMT_POINTS` which is the basis for return requirements points.
 *
 * - `[region code]:[return requirement ID]:[point ID]` - all values are NALD IDs
 *
 * @returns {string} - A randomly generated return requirement point external ID
 */
export function generateReturnRequirementPointExternalId() {
  const naldPointId = generateNaldPointId()

  return `9:${generateRandomInteger(100, 99999)}:${naldPointId}`
}

/**
 * Generate an UPRN for an address
 *
 * @returns {string} - A random UPRN
 */
export function generateUprn() {
  return generateRandomInteger(100, 999999)
}

/**
 * Generates a random user ID
 *
 * @returns {number} a random integer between 100011 and 199999
 */
export function generateUserId() {
  // The last ID in the pre-seeded users is 100010
  return generateRandomInteger(100011, 199999)
}

/**
 * Generates a random user name
 *
 * @returns {string} a random user name in the format [random UUID]@wrls.gov.uk
 */
export function generateUserName() {
  return `${generateUUID()}@wrls.gov.uk`
}

/**
 * Generates a random verification code
 *
 * @returns {string} a random 5-character verification code, using the allowed characters
 */
export function generateVerificationCode() {
  return Array.from({ length: VERIFICATION_CODE_LENGTH }, () => {
    return VERIFICATION_CODE_CHARACTERS.charAt(generateRandomInteger(0, VERIFICATION_CODE_CHARACTERS.length - 1))
  }).join('')
}
