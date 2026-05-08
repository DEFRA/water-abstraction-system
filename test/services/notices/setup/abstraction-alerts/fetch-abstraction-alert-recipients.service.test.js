'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')

// Thing under test
const FetchAbstractionAlertRecipientsService = require('../../../../../app/services/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.service.js')

describe('Notices - Setup - Abstraction Alerts - Fetch Abstraction Alert Recipients service', () => {
  let scenarios
  let session

  before(async () => {
    scenarios = []

    // 1) Licence holder only
    const scenario = await RecipientScenariosSeeder.licenceHolderOnly([], null, true)
    scenarios.push(scenario)

    session = { licenceRefs: [scenarios[0][0].licenceRef] }
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when there are abstraction alert recipients to notify', () => {
    it('fetches the correct recipient data', async () => {
      const result = await FetchAbstractionAlertRecipientsService.go(session)

      const expectedResults = _transformToResult(scenarios[0])

      expect(result).to.equal(expectedResults)
    })
  })
})

function _transformToResult(scenario) {
  const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenario)

  for (const sendingResult of sendingResults) {
    delete sendingResult.due_date_status
    delete sendingResult.return_log_ids
    delete sendingResult.latest_due_date
  }

  return sendingResults
}
