'use strict'

// Test helpers
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')

// Thing under test
const FetchAlternateRenewalRecipientsService = require('../../../../../app/services/notices/setup/renewal-notice/fetch-alternate-renewal-recipients.service.js')

describe('Notices - Setup - Renewal Notice - Fetch Alternate Renewal Recipients service', () => {
  let scenarios

  beforeAll(async () => {
    scenarios = {}

    // 1) Licence holder only
    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly()
  })

  afterAll(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when service is called for sending the "alternate notice"', () => {
    it('fetches the correct recipient data for sending the notice', async () => {
      const licenceRefs = scenarios.licenceHolder.licenceHolderRecipient.licenceRefs
      const results = await FetchAlternateRenewalRecipientsService(licenceRefs)

      const expectedResult = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

      expect(results).toEqual(expectedResult)
    })
  })
})
