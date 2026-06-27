'use strict'

// Test helpers
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')

// Thing under test
const FetchAbstractionAlertRecipientsDal = require('../../../../../app/dal/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.dal.js')

describe('Notices - Setup - Abstraction Alerts - Fetch Abstraction Alert Recipients DAL', () => {
  let scenarios
  let session

  beforeAll(async () => {
    scenarios = {}

    // 1) Licence holder only
    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly()

    session = { licenceRefs: scenarios.licenceHolder.licenceHolderRecipient.licenceRefs }
  })

  afterAll(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when there are abstraction alert recipients to notify', () => {
    it('fetches the correct recipient data', async () => {
      const result = await FetchAbstractionAlertRecipientsDal.go(session)

      const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

      expect(result).toEqual(expectedResults)
    })
  })
})
