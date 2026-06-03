'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')

// Thing under test
const FetchAbstractionAlertRecipientsDal = require('../../../../../app/dal/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.dal.js')

describe('Notices - Setup - Abstraction Alerts - Fetch Abstraction Alert Recipients DAl', () => {
  let scenarios
  let session

  before(async () => {
    scenarios = {}

    // 1) Licence holder only
    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly()

    session = { licenceRefs: scenarios.licenceHolder.licenceHolderRecipient.licenceRefs }
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when there are abstraction alert recipients to notify', () => {
    it('fetches the correct recipient data', async () => {
      const result = await FetchAbstractionAlertRecipientsDal.go(session)

      const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

      expect(result).to.equal(expectedResults)
    })
  })
})
