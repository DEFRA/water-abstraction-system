'use strict'

/**
 * @module RecipientScenariosSeeder
 */

const CRMContactsSeeder = require('./crm-contacts.seeder.js')
const EmptyLicence = require('./empty-licence.seeder.js')
const RecipientsSeeder = require('./recipients.seeder.js')
const LicenceVersionHelper = require('../helpers/licence-version.helper.js')
const { compareStrings } = require('../../../app/lib/general.lib.js')

/**
 * Cleans up records created by the recipient scenarios
 *
 * It checks each 'scenario' for known records, and using its knowledge of 'scenarios' deletes the data created
 * during testing.
 *
 * @param {object[]} scenarios - The scenarios created by a test suite
 */
async function clean(scenarios) {
  for (const recipients of scenarios) {
    for (const recipient of recipients) {
      await RecipientsSeeder.clean(recipient)
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
 * @param {object[]} returnLogs - One or more returns logs sharing the same licence reference tha will be assigned to
 * the recipient
 * @param {Date} [expiredDate] - The date the licence should expire.
 * @param {boolean} alerts - If the recipient os for abstraction alerts
 *
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case there is only the licence holder
 */
async function licenceHolderOnly(returnLogs, expiredDate = null, alerts = false) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0], null, expiredDate)
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Licenceonlyholder')

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder(licence, licenceHolder)

  const allLicenceRefs = expiredDate || alerts ? [licence.licence.licenceRef] : licenceRefs

  licenceHolderRecipient.licenceRefs = allLicenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient]
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
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case both the licence holder and
 * returns to recipients
 */
async function licenceHolderWithDifferentReturnsTo(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0])
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Holderandreturnsto')

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const returnsToHolder = await CRMContactsSeeder.returnsTo(licence, licenceHolder, 'Returnstoandholder')

  const returnsToRecipient = await RecipientsSeeder.returnsTo(licence, returnsToHolder)

  returnsToRecipient.licenceRefs = licenceRefs
  returnsToRecipient.returnLogIds = returnLogIds
  returnsToRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient, returnsToRecipient]
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
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case both licence holder recipients
 */
async function licenceHolderWithMultipleLicences(returnLogs, expiredDate) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0], null, expiredDate)
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Multiplelicenceholder')

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder(licence, licenceHolder)

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

  const secondLicenceHolderRecipient = await RecipientsSeeder.licenceHolder(secondLicence, licenceHolder)

  const allLicenceRefs = expiredDate ? [licence.licence.licenceRef, secondLicence.licence.licenceRef] : licenceRefs

  licenceHolderRecipient.licenceRefs = allLicenceRefs
  secondLicenceHolderRecipient.licenceRefs = allLicenceRefs
  secondLicenceHolderRecipient.returnLogIds = returnLogIds
  secondLicenceHolderRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient, secondLicenceHolderRecipient]
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
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case both the licence holder and
 * returns to recipients, though the query should only fetch the licence holder
 */
async function licenceHolderWithSameReturnsTo(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0])
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Samelicenceholderreturnsto')

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const returnsToHolder = await CRMContactsSeeder.returnsTo(licence, licenceHolder)

  const returnsToRecipient = await RecipientsSeeder.returnsTo(licence, returnsToHolder)

  returnsToRecipient.licenceRefs = licenceRefs
  returnsToRecipient.returnLogIds = returnLogIds
  returnsToRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient, returnsToRecipient]
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
 * @param {object[]} returnLogs - One or more returns logs sharing the same licence reference that will be assigned to
 * the recipient
 * @param {Date} [expiredDate] - The date the licence should expire.
 *
 * @returns {Promise<object[]>} The recipients generated for the scenario. This includes the licence holder and
 * primary user
 */
async function primaryUserOnly(returnLogs, expiredDate = null) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0], null, expiredDate)
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Primaryonlyholder')

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.licenceRefs = expiredDate ? [licence.licence.licenceRef] : licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUser = await CRMContactsSeeder.primaryUser(licence, 'primaryuseronly@puonly.com')

  const primaryUserRecipient = await RecipientsSeeder.primaryUser(licence, primaryUser)

  primaryUserRecipient.licenceRefs = expiredDate ? [licence.licence.licenceRef] : licenceRefs
  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient, primaryUserRecipient]
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
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case both the primary user and
 * returns user recipients, plus the licence holder
 */
async function primaryUserWithDifferentReturnsAgent(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0])
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Primaryandreturnsuser')

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUser = await CRMContactsSeeder.primaryUser(licence, 'primaryuser@pura.com')

  const primaryUserRecipient = await RecipientsSeeder.primaryUser(licence, primaryUser)

  primaryUserRecipient.licenceRefs = licenceRefs
  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  const returnsUser = await CRMContactsSeeder.returnsUser(licence, 'returnsuser@pura.com')

  const returnsUserRecipient = await RecipientsSeeder.returnsUser(licence, returnsUser)

  returnsUserRecipient.licenceRefs = licenceRefs
  returnsUserRecipient.returnLogIds = returnLogIds
  returnsUserRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient, primaryUserRecipient, returnsUserRecipient]
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
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case both primary user recipients
 * and both licence holders
 */
async function primaryUserWithMultipleLicences(returnLogs, expiredDate) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0], null, expiredDate)
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Multipleprimary')

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUser = await CRMContactsSeeder.primaryUser(licence, 'primaryuser@pumulti.com')

  const primaryUserRecipient = await RecipientsSeeder.primaryUser(licence, primaryUser)

  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  const secondLicence = await EmptyLicence.seed(licenceRefs[1], null, expiredDate)
  const secondLicenceHolder = await CRMContactsSeeder.licenceHolder(secondLicence, 'Multipleprimary')

  const secondLicenceHolderRecipient = await RecipientsSeeder.licenceHolder(secondLicence, secondLicenceHolder)

  secondLicenceHolderRecipient.returnLogIds = returnLogIds
  secondLicenceHolderRecipient.returnLogs = returnLogs

  const secondPrimaryUser = await CRMContactsSeeder.primaryUser(secondLicence, 'primaryuser@pumulti.com')

  const secondPrimaryUserRecipient = await RecipientsSeeder.primaryUser(secondLicence, secondPrimaryUser)

  secondPrimaryUserRecipient.returnLogIds = returnLogIds
  secondPrimaryUserRecipient.returnLogs = returnLogs

  const allLicenceRefs = expiredDate ? [licence.licence.licenceRef, secondLicence.licence.licenceRef] : licenceRefs

  licenceHolderRecipient.licenceRefs = allLicenceRefs
  secondLicenceHolderRecipient.licenceRefs = allLicenceRefs
  primaryUserRecipient.licenceRefs = allLicenceRefs
  secondPrimaryUserRecipient.licenceRefs = allLicenceRefs

  return [licenceHolderRecipient, secondLicenceHolderRecipient, primaryUserRecipient, secondPrimaryUserRecipient]
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
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case both the primary user and
 * returns user recipients, though the query should only fetch the primary user
 */
async function primaryUserWithSameReturnsAgent(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licence = await EmptyLicence.seed(licenceRefs[0])
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Sameprimaryuserreturnsuser')

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUser = await CRMContactsSeeder.primaryUser(licence, 'same@pura.com')

  const primaryUserRecipient = await RecipientsSeeder.primaryUser(licence, primaryUser)

  primaryUserRecipient.licenceRefs = licenceRefs
  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  const returnsUser = await CRMContactsSeeder.returnsUser(licence, 'same@pura.com')

  const returnsUserRecipient = await RecipientsSeeder.returnsUser(licence, returnsUser)

  returnsUserRecipient.licenceRefs = licenceRefs
  returnsUserRecipient.returnLogIds = returnLogIds
  returnsUserRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient, primaryUserRecipient, returnsUserRecipient]
}

/**
 * Transforms the recipients linked to a scenario into 'recipient for sending' results
 *
 * Use when you need to verify the result of executing the `GenerateRecipientsQueryService` with the `download` flag
 * set to false.
 *
 * @param {object[]} scenarios - The scenarios created by a test suite to be transformed
 *
 * @returns {object[]} The transformed downloading result objects
 */
function transformToSendingResults(scenarios) {
  return scenarios.map((recipient) => {
    return RecipientsSeeder.transformToSendingResult(recipient)
  })
}

/**
 * Transforms the recipients linked to a scenario into 'recipient for download' results
 *
 * Use when you need to verify the result of executing the `GenerateRecipientsQueryService` with the `download` flag
 * set to true.
 *
 * @param {object[]} scenarios - The scenarios created by a test suite to be transformed
 *
 * @returns {object[]} The transformed downloading result objects
 */
function transformToDownloadingResults(scenarios) {
  const downloadResults = []

  for (const recipient of scenarios) {
    for (const returnLog of recipient.returnLogs) {
      const downloadResult = RecipientsSeeder.transformToDownloadingResult(recipient, returnLog)

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

module.exports = {
  clean,
  licenceHolderOnly,
  licenceHolderWithDifferentReturnsTo,
  licenceHolderWithMultipleLicences,
  licenceHolderWithSameReturnsTo,
  primaryUserOnly,
  primaryUserWithDifferentReturnsAgent,
  primaryUserWithMultipleLicences,
  primaryUserWithSameReturnsAgent,
  transformToDownloadingResults,
  transformToSendingResults
}
