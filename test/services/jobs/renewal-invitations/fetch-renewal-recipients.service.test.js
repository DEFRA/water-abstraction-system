'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientScenariosSeeder = require('../../../support/seeders/recipient-scenarios.seeder.js')

// Thing under test
const FetchRenewalRecipients = require('../../../../app/services/jobs/renewal-invitations/fetch-renewal-recipients.service.js')

describe('Jobs - Renewal Invitations - Fetch Renewal recipients service', () => {
  let clock
  let expiredDate
  let scenarios
  let todayDate

  before(async () => {
    todayDate = new Date('2026-04-15')

    clock = Sinon.useFakeTimers(todayDate)

    scenarios = []

    // 1) Licence holder only
    expiredDate = new Date('2027-02-09')
    const scenario = await RecipientScenariosSeeder.licenceHolderOnly([], expiredDate)
    scenarios.push(scenario)
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)

    clock.restore()
    Sinon.restore()
  })

  describe('when there are renewal invitations to send', () => {
    it('(Scenario 1) returns the licence holder when only the licence holder is present', async () => {
      const result = await FetchRenewalRecipients.go(new Date('2027-02-09'))

      const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[0])

      _formatScenario(sendingResults[0])

      expect(result).to.equal(sendingResults)
    })
  })
})

function _formatScenario(sendingResults) {
  delete sendingResults.due_date_status
  delete sendingResults.return_log_ids
  delete sendingResults.latest_due_date
}
