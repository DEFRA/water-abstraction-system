'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientScenariosSeeder = require('../../../support/seeders/recipient-scenarios.seeder.js')

// Thing under test
const FetchRenewalRecipients = require('../../../../app/services/jobs/renewal-invitations/fetch-renewal-recipients.service.js')

describe('Jobs - Renewal Invitations - Fetch Renewal recipients service', () => {
  let expiredDate
  let scenarios

  before(async () => {
    scenarios = []

    // 1) Licence holder only
    expiredDate = new Date('2027-02-09')
    const scenario = await RecipientScenariosSeeder.licenceHolderOnly([], expiredDate)
    scenarios.push(scenario)
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when there are renewal invitations to send', () => {
    it('fetches the correct recipient data', async () => {
      const result = await FetchRenewalRecipients.go(new Date('2027-02-09'))

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
