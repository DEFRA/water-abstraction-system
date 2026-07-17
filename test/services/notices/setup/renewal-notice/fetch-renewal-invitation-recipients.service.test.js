// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import * as RecipientScenariosSeeder from '../../../../support/seeders/recipient-scenarios.seeder.js'

// Thing under test
import FetchRenewalInvitationRecipientsService from '../../../../../app/services/notices/setup/renewal-notice/fetch-renewal-invitation-recipients.service.js'

describe('Notices - Setup - Renewal Notice - Fetch Renewal Invitation Recipients service', () => {
  let scenarios

  beforeAll(async () => {
    scenarios = {}

    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly()
    scenarios.primaryUser = await RecipientScenariosSeeder.primaryUserOnly()
  })

  afterAll(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when the licence is unregistered (no primary user)', () => {
    it('returns the licence holder as the recipient', async () => {
      const licenceRef = scenarios.licenceHolder.licenceHolderRecipient.licenceRefs[0]

      const results = await FetchRenewalInvitationRecipientsService({ licenceRef })

      const expectedResult = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

      expect(results).toEqual(expectedResult)
    })
  })

  describe('when the licence is registered (has a primary user)', () => {
    it('returns the primary user as the recipient (not the licence holder)', async () => {
      const licenceRef = scenarios.primaryUser.primaryUserRecipient.licenceRefs[0]

      const results = await FetchRenewalInvitationRecipientsService({ licenceRef })

      const expectedResult = RecipientScenariosSeeder.transformToSendingResults({
        primaryUserRecipient: scenarios.primaryUser.primaryUserRecipient
      })

      expect(results).toEqual(expectedResult)
    })
  })
})
