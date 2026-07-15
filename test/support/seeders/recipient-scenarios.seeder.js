/**
 * @module RecipientScenariosSeeder
 */

import * as CRMContactsSeeder from './crm-contacts.seeder.js'
import * as EmptyLicence from './empty-licence.seeder.js'
import * as LicenceVersionHelper from '../helpers/licence-version.helper.js'
import * as RecipientsFormatter from './recipients.formatter.js'
import { compareStrings } from '../../../app/lib/general.lib.js'

/**
 * Seeds an additional contact recipient for an existing licence
 *
 * @param {boolean} [abstractionAlerts] - Whether the contact has abstraction alerts enabled
 * @param {Date|null} [licenceVersionEndDate] - Optional licence version end date
 * @param {Date|null} [deletedAt] - Optional soft-delete date for the company contact
 * @param {string} [name] - The company name for the licence holder
 * @param {object|null} [contactData] - Optional contact data overrides
 *
 * @returns {Promise<object>} An object representing the recipient and its properties for easier testing
 */
export async function additionalContactRecipient(
  abstractionAlerts = true,
  licenceVersionEndDate = null,
  deletedAt = null,
  name = 'LicenceHolderForAdditonalContact',
  contactData = null
) {
  const licence = await EmptyLicence.seed()
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, name, null, licenceVersionEndDate)

  const licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)

  const additionalContact = await CRMContactsSeeder.additionalContact(
    licenceHolder,
    contactData,
    abstractionAlerts,
    deletedAt
  )

  const additionalContactRecipient = await RecipientsFormatter.additionalContact(licence, additionalContact)

  return { licenceHolderRecipient, additionalContactRecipient }
}

/**
 * Cleans up records created by the recipient scenarios
 *
 * It checks each 'scenario' for known records, and using its knowledge of 'scenarios' deletes the data created
 * during testing.
 *
 * @param {object[]} scenarios - The scenarios created by a test suite
 */
export async function clean(scenarios) {
  for (const recipients of Object.values(scenarios)) {
    for (const recipient of Object.values(recipients)) {
      await RecipientsFormatter.clean(recipient)
    }
  }
}

/**
 * Seeds test data where one or more return logs is linked to a single 'licence holder' recipient
 *
 * > This will only work if the return logs passed in share the _same_ licence reference
 *
 * It aggregates the returns logs passed into to create a unique array of both licence references and return log IDs.
 *
 * It then creates a licence document header record using the first licence ref and populates it with a licence holder
 * contact. The aggregated data is assigned to the recipient object to make testing easier.
 *
 * @param {object[]} [returnLogs] - One or more returns logs sharing the same licence reference tha will be assigned to
 * the recipient
 * @param {Date} [expiredDate] - The date the licence should expire
 *
 * @returns {Promise<object>} The recipients generated for the scenario. In this case there is only the licence holder
 */
export async function licenceHolderOnly(returnLogs = [], expiredDate = null) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0], null, expiredDate)
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Licenceonlyholder')

  const licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  return {
    licenceHolderRecipient
  }
}

/**
 * Seeds test data where one or more return logs is linked to both a 'licence holder' and 'returns to' recipient
 *
 * > This will only work if the return logs passed in share the _same_ licence reference
 *
 * It aggregates the returns logs passed into to create a unique array of both licence references and return log IDs.
 *
 * It then creates a licence record using the first licence ref and populates it with both a licence
 * holder and returns to contact. The aggregated data is assigned to the recipient objects to make testing easier.
 *
 * @param {object[]} returnLogs - One or more returns logs sharing the same licence reference that will be assigned to
 * the recipients
 *
 * @returns {Promise<object>} The recipients generated for the scenario. In this case both the licence holder and
 * returns to recipients
 */
export async function licenceHolderWithDifferentReturnsTo(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0])
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Holderandreturnsto')

  const licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const returnsToHolder = await CRMContactsSeeder.returnsTo(licence, licenceHolder, 'Returnstoandholder')

  const returnsToRecipient = await RecipientsFormatter.returnsTo(licence, returnsToHolder)

  returnsToRecipient.returnLogIds = returnLogIds
  returnsToRecipient.returnLogs = returnLogs

  return { licenceHolderRecipient, returnsToRecipient }
}

/**
 * Seeds test data where a single 'licence holder' recipient is linked to multiple return logs for different licences
 *
 * > This will only work if the return logs passed in have _different_ licence references
 *
 * It aggregates the returns logs passed into to create a unique array of both licence references and return log IDs.
 *
 * It then creates a licence document header record using the first licence ref and populates it with a licence holder
 * contact.
 *
 * It creates another licence document header record using the second licence ref and populates it with the same licence
 * holder contact.
 *
 * The aggregated data is assigned to both recipient objects to make testing easier.
 *
 * @param {object[]} returnLogs - One or more returns logs with different licence references that will be assigned to
 * the recipients
 * @param {Date} [expiredDate] - The date the licence should expire.
 *
 * @returns {Promise<object>} The recipients generated for the scenario. In this case both licence holder recipients
 */
export async function licenceHolderWithMultipleLicences(returnLogs, expiredDate) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0], null, expiredDate)
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Multiplelicenceholder')

  const licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const secondLicence = await EmptyLicence.seed(licenceRefs[1], null, expiredDate)

  // Add a licence version to link the company to the new licence
  await LicenceVersionHelper.add({
    addressId: licenceHolder.address.id,
    companyId: licenceHolder.company.id,
    endDate: null,
    licenceId: secondLicence.licence.id
  })

  const secondLicenceHolderRecipient = await RecipientsFormatter.licenceHolder(secondLicence, licenceHolder)

  const allLicenceRefs = expiredDate ? [licence.licence.licenceRef, secondLicence.licence.licenceRef] : licenceRefs

  licenceHolderRecipient.licenceRefs = allLicenceRefs
  secondLicenceHolderRecipient.licenceRefs = allLicenceRefs
  secondLicenceHolderRecipient.returnLogIds = returnLogIds
  secondLicenceHolderRecipient.returnLogs = returnLogs

  return { licenceHolderRecipient, secondLicenceHolderRecipient }
}

/**
 * Seeds test data where one or more return logs is linked to the same 'licence holder' and 'returns to' recipient
 *
 * > This will only work if the return logs passed in share the _same_ licence reference
 *
 * It aggregates the returns logs passed into to create a unique array of both licence references and return log IDs.
 *
 * It then creates a licence document header record using the first licence ref and populates it with the same contact
 * for both the licence holder and returns to. The aggregated data is assigned to the recipient objects to make testing
 * easier.
 *
 * @param {object[]} returnLogs - One or more returns logs sharing the same licence reference that will be assigned to
 * the recipient
 *
 * @returns {Promise<object>} The recipients generated for the scenario. In this case both the licence holder and
 * returns to recipients, though the query should only fetch the licence holder
 */
export async function licenceHolderWithSameReturnsTo(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0])
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Samelicenceholderreturnsto')

  const licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const returnsToHolder = await CRMContactsSeeder.returnsTo(licence, licenceHolder)

  const returnsToRecipient = await RecipientsFormatter.returnsTo(licence, returnsToHolder)

  returnsToRecipient.returnLogIds = returnLogIds
  returnsToRecipient.returnLogs = returnLogs

  return { licenceHolderRecipient, returnsToRecipient }
}

/**
 * Seeds test data where one or more return logs is linked to a single 'primary user' recipient
 *
 * > This will only work if the return logs passed in share the _same_ licence reference
 *
 * It aggregates the returns logs passed into to create a unique array of both licence references and return log IDs.
 *
 * It then creates a licence document header record using the first licence ref and populates it with a licence holder
 * contact.
 *
 * It then creates a licence entity record with the primary user's email address. This is then linked to the licence
 * document header via a licence entity role, where the role is set as `primary_user`.
 *
 * Voila! You have a registered licence with a primary user.
 *
 * The aggregated data is assigned to the recipient object to make testing easier.
 *
 * @param {object[]} [returnLogs] - One or more returns logs sharing the same licence reference that will be assigned to
 * the recipient
 * @param {Date} [expiredDate] - The date the licence should expire.
 *
 * @returns {Promise<object>} The recipients generated for the scenario. This includes the licence holder and
 * primary user
 */
export async function primaryUserOnly(returnLogs = [], expiredDate = null) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0], null, expiredDate)
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Primaryonlyholder')

  const licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUser = await CRMContactsSeeder.primaryUser(licence, 'primaryuseronly@puonly.com')

  const primaryUserRecipient = await RecipientsFormatter.primaryUser(licence, primaryUser)

  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  return { licenceHolderRecipient, primaryUserRecipient }
}

/**
 * Seeds test data where one or more return logs is linked to both a 'primary user' and 'returns user' recipient
 *
 * > This will only work if the return logs passed in share the _same_ licence reference
 *
 * It aggregates the returns logs passed into to create a unique array of both licence references and return log IDs.
 *
 * It then creates a licence document header record using the first licence ref and populates it with a licence holder
 * contact.
 *
 * It then creates a licence entity record with the primary user's email address. This is then linked to the licence
 * document header via a licence entity role, where the role is set as `primary_user`.
 *
 * Voila! You have a registered licence with a primary user.
 *
 * Next, it creates another licence entity record with the returns user's email address. This is then linked to the
 * same licence document header via a second licence entity role, where the role is set as `returns_user`.
 *
 * The aggregated data is assigned to the recipient objects to make testing easier.
 *
 * @param {object[]} returnLogs - One or more returns logs sharing the same licence reference that will be assigned to
 * the recipients
 *
 * @returns {Promise<object>} The recipients generated for the scenario. In this case both the primary user and
 * returns user recipients, plus the licence holder
 */
export async function primaryUserWithDifferentReturnsAgent(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0])
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Primaryandreturnsuser')

  const licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUser = await CRMContactsSeeder.primaryUser(licence, 'primaryuser@pura.com')

  const primaryUserRecipient = await RecipientsFormatter.primaryUser(licence, primaryUser)

  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  const returnsUser = await CRMContactsSeeder.returnsUser(licence, 'returnsuser@pura.com')

  const returnsUserRecipient = await RecipientsFormatter.returnsUser(licence, returnsUser)

  returnsUserRecipient.returnLogIds = returnLogIds
  returnsUserRecipient.returnLogs = returnLogs

  return { licenceHolderRecipient, primaryUserRecipient, returnsUserRecipient }
}

/**
 * Seeds test data where a single 'primary user' recipient is linked to multiple return logs for different licences
 *
 * > This will only work if the return logs passed in have _different_ licence references
 *
 * It aggregates the returns logs passed into to create a unique array of both licence references and return log IDs.
 *
 * It then creates a licence document header record using the first licence ref and populates it with a licence holder
 * contact.
 *
 * It then creates a licence entity record with the primary user's email address. This is then linked to the licence
 * document header via a licence entity role, where the role is set as `primary_user`.
 *
 * It then creates another licence document header record using the second licence ref and populates it with the same
 * licence holder contact, followed by another primary user.
 *
 * The aggregated data is assigned to both recipient objects to make testing easier.
 *
 * @param {object[]} returnLogs - One or more returns logs with different licence references that will be assigned to
 * the recipients
 * @param {Date} [expiredDate] - The date the licence should expire.
 *
 * @returns {Promise<object>} The recipients generated for the scenario. In this case both primary user recipients
 * and both licence holders
 */
export async function primaryUserWithMultipleLicences(returnLogs, expiredDate) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0], null, expiredDate)
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Multipleprimary')

  const licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUser = await CRMContactsSeeder.primaryUser(licence, 'primaryuser@pumulti.com')

  const primaryUserRecipient = await RecipientsFormatter.primaryUser(licence, primaryUser)

  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  const secondLicence = await EmptyLicence.seed(licenceRefs[1], null, expiredDate)
  const secondLicenceHolder = await CRMContactsSeeder.licenceHolder(secondLicence, 'Multipleprimary')

  const secondLicenceHolderRecipient = await RecipientsFormatter.licenceHolder(secondLicence, secondLicenceHolder)

  secondLicenceHolderRecipient.returnLogIds = returnLogIds
  secondLicenceHolderRecipient.returnLogs = returnLogs

  const secondPrimaryUser = await CRMContactsSeeder.primaryUser(secondLicence, 'primaryuser@pumulti.com')

  const secondPrimaryUserRecipient = await RecipientsFormatter.primaryUser(secondLicence, secondPrimaryUser)

  secondPrimaryUserRecipient.returnLogIds = returnLogIds
  secondPrimaryUserRecipient.returnLogs = returnLogs

  const allLicenceRefs = expiredDate ? [licence.licence.licenceRef, secondLicence.licence.licenceRef] : licenceRefs

  licenceHolderRecipient.licenceRefs = allLicenceRefs
  secondLicenceHolderRecipient.licenceRefs = allLicenceRefs
  primaryUserRecipient.licenceRefs = allLicenceRefs
  secondPrimaryUserRecipient.licenceRefs = allLicenceRefs

  return { licenceHolderRecipient, primaryUserRecipient, secondLicenceHolderRecipient, secondPrimaryUserRecipient }
}

/**
 * Seeds test data where one or more return logs is linked to the same 'primary user' and 'returns user' recipient
 *
 * > This will only work if the return logs passed in share the _same_ licence reference
 *
 * It aggregates the returns logs passed into to create a unique array of both licence references and return log IDs.
 *
 * It then creates a licence document header record using the first licence ref and populates it with a licence holder
 * contact.
 *
 * It then creates a licence entity record with the primary user's email address. This is then linked to the licence
 * document header via a licence entity role, where the role is set as `primary_user`.
 *
 * Voila! You have a registered licence with a primary user.
 *
 * Next, it creates another licence entity record with the same email address. This is then linked to the
 * same licence document header via a second licence entity role, where the role is set as `returns_user`.
 *
 * The aggregated data is assigned to the recipient objects to make testing easier.
 *
 * @param {object[]} returnLogs - One or more returns logs sharing the same licence reference that will be assigned to
 * the recipient
 *
 * @returns {Promise<object>} The recipients generated for the scenario. In this case both the primary user and
 * returns user recipients, though the query should only fetch the primary user
 */
export async function primaryUserWithSameReturnsAgent(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0])
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Sameprimaryuserreturnsuser')

  const licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUser = await CRMContactsSeeder.primaryUser(licence, 'same@pura.com')

  const primaryUserRecipient = await RecipientsFormatter.primaryUser(licence, primaryUser)

  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  const returnsUser = await CRMContactsSeeder.returnsUser(licence, 'same@pura.com')

  const returnsUserRecipient = await RecipientsFormatter.returnsUser(licence, returnsUser)

  returnsUserRecipient.returnLogIds = returnLogIds
  returnsUserRecipient.returnLogs = returnLogs

  return { licenceHolderRecipient, primaryUserRecipient, returnsUserRecipient }
}

/**
 * Transforms the recipients linked to a scenario into 'recipient for sending' results
 *
 * Use when you need to verify the result of executing the `GenerateRecipientsQueryService` with the `download` flag
 * set to false.
 *
 * @param {object} scenarios - The scenarios created by a test suite to be transformed
 *
 * @returns {object[]} The transformed sending result objects
 */
export function transformToSendingResults(scenarios) {
  return Object.values(scenarios).map((recipient) => {
    return RecipientsFormatter.transformToSendingResult(recipient)
  })
}

/**
 * Transforms the recipients linked to a scenario into 'recipient for download' results
 *
 * Use when you need to verify the result of executing the `GenerateRecipientsQueryService` with the `download` flag
 * set to true.
 *
 * @param {object} scenarios - The scenarios created by a test suite to be transformed
 *
 * @returns {object[]} The transformed downloading result objects
 */
export function transformToDownloadingResults(scenarios) {
  const downloadResults = []

  for (const recipient of Object.values(scenarios)) {
    for (const returnLog of recipient.returnLogs) {
      const downloadResult = RecipientsFormatter.transformToDownloadingResult(recipient, returnLog)

      downloadResults.push(downloadResult)
    }
  }

  return downloadResults
}

function _aggregatedData(returnLogs) {
  const allLicenceRefs = returnLogs.map((returnLog) => {
    return returnLog.licenceRef
  })

  const allReturnLogIds = returnLogs.map((returnLog) => {
    return returnLog.id
  })

  const distinctLicenceRefs = [...new Set(allLicenceRefs)]
  const distinctReturnLogsIds = [...new Set(allReturnLogIds)]

  return {
    licenceRefs: distinctLicenceRefs.sort((referenceString, compareString) => {
      return compareStrings(referenceString, compareString)
    }),
    returnLogIds: distinctReturnLogsIds.sort((referenceString, compareString) => {
      return compareStrings(referenceString, compareString)
    })
  }
}
