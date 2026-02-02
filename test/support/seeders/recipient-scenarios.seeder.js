'use strict'

/**
 * @module RecipientScenariosSeeder
 */

const RecipientsSeeder = require('./recipients.seeder.js')

/**
 * Cleans up records created by the recipient scenarios
 *
 * It checks each 'scenario' for known records, and using its knowledge of 'scenarios' deletes the data created
 * during testing.
 *
 * @param {object[]} scenarios - The scenarios created by a test suite
 */
async function clean(scenarios) {
  for (const recipient of scenarios) {
    await RecipientsSeeder.clean(recipient)
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
 *
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case there is only the licence holder
 */
async function licenceHolderOnly(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder('Licenceonlyholder', licenceRefs[0])

  licenceHolderRecipient.licenceRefs = licenceRefs
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
 * It then creates a licence document header record using the first licence ref and populates it with both a licence
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

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder('Holderandreturnsto', licenceRefs[0])

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const returnsToRecipient = await RecipientsSeeder.returnsTo(
    licenceHolderRecipient.licenceDocumentHeader,
    'Returnstoandholder'
  )

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
 *
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case both licence holder recipients
 */
async function licenceHolderWithMultipleLicences(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder('Multiplelicenceholder', licenceRefs[0])

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const secondLicenceHolderRecipient = await RecipientsSeeder.licenceHolder('Multiplelicenceholder', licenceRefs[1])

  secondLicenceHolderRecipient.licenceRefs = licenceRefs
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

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder('Samelicenceholderreturnsto', licenceRefs[0])

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const returnsToRecipient = await RecipientsSeeder.returnsTo(
    licenceHolderRecipient.licenceDocumentHeader,
    'Samelicenceholderreturnsto'
  )

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
 *
 * @returns {Promise<object[]>} The recipients generated for the scenario. This includes the licence holder and
 * primary user
 */
async function primaryUserOnly(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder('Primaryonlyholder', licenceRefs[0])

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUserRecipient = await RecipientsSeeder.primaryUser(
    licenceHolderRecipient.licenceDocumentHeader,
    'primaryuseronly@puonly.com'
  )

  primaryUserRecipient.licenceRefs = licenceRefs
  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient, primaryUserRecipient]
}

/**
 * Seeds test data where one or more return logs is linked to both a 'primary user' and 'returns agent' recipient
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
 * Next, it creates another licence entity record with the returns agent's email address. This is then linked to the
 * same licence document header via a second licence entity role, where the role is set as `returns_agent`.
 *
 * The aggregated data is assigned to the recipient objects to make testing easier.
 *
 * @param {object[]} returnLogs - One or more returns logs sharing the same licence reference that will be assigned to
 * the recipients
 *
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case both the primary user and
 * returns agent recipients, plus the licence holder
 */
async function primaryUserWithDifferentReturnsAgent(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder('Primaryandreturnsagent', licenceRefs[0])

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUserRecipient = await RecipientsSeeder.primaryUser(
    licenceHolderRecipient.licenceDocumentHeader,
    'primaryuser@pura.com'
  )

  primaryUserRecipient.licenceRefs = licenceRefs
  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  const returnsAgentRecipient = await RecipientsSeeder.returnsAgent(
    licenceHolderRecipient.licenceDocumentHeader,
    'returnsagent@pura.com'
  )

  returnsAgentRecipient.licenceRefs = licenceRefs
  returnsAgentRecipient.returnLogIds = returnLogIds
  returnsAgentRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient, primaryUserRecipient, returnsAgentRecipient]
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
 *
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case both primary user recipients
 * and both licence holders
 */
async function primaryUserWithMultipleLicences(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder('Multipleprimary', licenceRefs[0])

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUserRecipient = await RecipientsSeeder.primaryUser(
    licenceHolderRecipient.licenceDocumentHeader,
    'primaryuser@pumulti.com'
  )

  primaryUserRecipient.licenceRefs = licenceRefs
  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  const secondLicenceHolderRecipient = await RecipientsSeeder.licenceHolder('Multipleprimary', licenceRefs[1])

  secondLicenceHolderRecipient.licenceRefs = licenceRefs
  secondLicenceHolderRecipient.returnLogIds = returnLogIds
  secondLicenceHolderRecipient.returnLogs = returnLogs

  const secondPrimaryUserRecipient = await RecipientsSeeder.primaryUser(
    secondLicenceHolderRecipient.licenceDocumentHeader,
    'primaryuser@pumulti.com'
  )

  secondPrimaryUserRecipient.licenceRefs = licenceRefs
  secondPrimaryUserRecipient.returnLogIds = returnLogIds
  secondPrimaryUserRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient, secondLicenceHolderRecipient, primaryUserRecipient, secondPrimaryUserRecipient]
}

/**
 * Seeds test data where one or more return logs is linked to the same 'primary user' and 'returns agent' recipient
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
 * same licence document header via a second licence entity role, where the role is set as `returns_agent`.
 *
 * The aggregated data is assigned to the recipient objects to make testing easier.
 *
 * @param {object[]} returnLogs - One or more returns logs sharing the same licence reference that will be assigned to
 * the recipient
 *
 * @returns {Promise<object[]>} The recipients generated for the scenario. In this case both the primary user and
 * returns agent recipients, though the query should only fetch the primary user
 */
async function primaryUserWithSameReturnsAgent(returnLogs) {
  const { licenceRefs, returnLogIds } = _aggregatedData(returnLogs)

  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder('Sameprimaryuserreturnsagent', licenceRefs[0])

  licenceHolderRecipient.licenceRefs = licenceRefs
  licenceHolderRecipient.returnLogIds = returnLogIds
  licenceHolderRecipient.returnLogs = returnLogs

  const primaryUserRecipient = await RecipientsSeeder.primaryUser(
    licenceHolderRecipient.licenceDocumentHeader,
    'same@pura.com'
  )

  primaryUserRecipient.licenceRefs = licenceRefs
  primaryUserRecipient.returnLogIds = returnLogIds
  primaryUserRecipient.returnLogs = returnLogs

  const returnsAgentRecipient = await RecipientsSeeder.returnsAgent(
    licenceHolderRecipient.licenceDocumentHeader,
    'same@pura.com'
  )

  returnsAgentRecipient.licenceRefs = licenceRefs
  returnsAgentRecipient.returnLogIds = returnLogIds
  returnsAgentRecipient.returnLogs = returnLogs

  return [licenceHolderRecipient, primaryUserRecipient, returnsAgentRecipient]
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

  return { licenceRefs: distinctLicenceRefs.sort(), returnLogIds: distinctReturnLogsIds.sort() }
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
