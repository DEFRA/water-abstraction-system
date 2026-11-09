// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import * as RecipientScenariosSeeder from '../../../../support/seeders/recipient-scenarios.seeder.js'

// Thing under test
import FetchAlternateRenewalRecipientsDal from '../../../../../src/dal/notices/setup/renewal-notice/fetch-alternate-renewal-recipients.dal.js'

describe('Notices - Setup - Renewal Notice - Fetch Alternate Renewal Recipients DAL', () => {
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
      const results = await FetchAlternateRenewalRecipientsDal(licenceRefs)

      const expectedResult = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

      expect(results).toEqual(expectedResult)
    })
  })
})
