'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')

// Thing under test
const FetchRenewalInvitationRecipientsService = require('../../../../../app/services/notices/setup/renewal-notice/fetch-renewal-invitation-recipients.service.js')

describe('Notices - Setup - Renewal Notice - Fetch Renewal Invitation Recipients service', () => {
  let scenarios

  before(async () => {
    scenarios = {}

    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly()
    scenarios.primaryUser = await RecipientScenariosSeeder.primaryUserOnly()
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when the licence is unregistered (no primary user)', () => {
    it('returns the licence holder as the recipient', async () => {
      const licenceRef = scenarios.licenceHolder.licenceHolderRecipient.licenceRefs[0]

      const results = await FetchRenewalInvitationRecipientsService.go({ licenceRef })

      const expectedResult = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

      expect(results).to.equal(expectedResult)
    })
  })

  describe('when the licence is registered (has a primary user)', () => {
    it('returns the primary user as the recipient (not the licence holder)', async () => {
      const licenceRef = scenarios.primaryUser.primaryUserRecipient.licenceRefs[0]

      const results = await FetchRenewalInvitationRecipientsService.go({ licenceRef })

      const expectedResult = RecipientScenariosSeeder.transformToSendingResults({
        primaryUserRecipient: scenarios.primaryUser.primaryUserRecipient
      })

      expect(results).to.equal(expectedResult)
    })
  })
})
