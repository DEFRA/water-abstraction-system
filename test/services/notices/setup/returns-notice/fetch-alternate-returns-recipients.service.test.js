'use strict'

// Test helpers
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')
const ReturnLogHelper = require('../../../../support/helpers/return-log.helper.js')

// Thing under test
const FetchAlternateReturnsRecipients = require('../../../../../app/services/notices/setup/returns-notice/fetch-alternate-returns-recipients.service.js')

describe('Notices - Setup - Returns Notice - Fetch Alternate Returns Recipients service', () => {
  const notificationDueDate = new Date('2025-12-24')

  let returnLog
  let scenarios

  beforeAll(async () => {
    scenarios = {}

    // 1) Licence holder only
    returnLog = await ReturnLogHelper.add({ dueDate: null })

    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly([returnLog])
  })

  afterAll(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when service is called for sending the "alternate notice"', () => {
    it('fetches the correct recipient data for sending the notice', async () => {
      const results = await FetchAlternateReturnsRecipients.go([returnLog.id], notificationDueDate)

      const sendingResult = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

      sendingResult[0].notificationDueDate = notificationDueDate

      expect(results).toEqual(sendingResult)
    })
  })
})
