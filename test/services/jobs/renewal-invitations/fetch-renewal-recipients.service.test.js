// Test helpers
import RecipientScenariosSeeder from '../../../support/seeders/recipient-scenarios.seeder.js'

// Thing under test
import FetchRenewalRecipients from '../../../../app/services/jobs/renewal-invitations/fetch-renewal-recipients.service.js'

describe('Jobs - Renewal Invitations - Fetch Renewal recipients service', () => {
  let expiredDate
  let scenarios

  beforeAll(async () => {
    scenarios = {}

    // 1) Licence holder only
    expiredDate = new Date('2027-02-09')
    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly([], expiredDate)
  })

  afterAll(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when there are renewal invitations to send', () => {
    it('fetches the correct recipient data', async () => {
      const result = await FetchRenewalRecipients(new Date('2027-02-09'))

      const expectedResults = _transformToResult(scenarios.licenceHolder)

      expect(result).toEqual(expectedResults)
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
