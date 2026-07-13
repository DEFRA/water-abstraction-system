// Test framework dependencies

// Things we need to stub
import * as FetchLicencesService from '../../../../app/services/licences/end-dates/fetch-licences.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import LicencesConfig from '../../../../config/licences.config.js'
import * as CheckLicenceEndDatesService from '../../../../app/services/licences/end-dates/check-licence-end-dates.service.js'
import { generateUUID, pause } from '../../../../app/lib/general.lib.js'

// Thing under test
import CheckAllLicenceEndDatesService from '../../../../app/services/licences/end-dates/check-all-licence-end-dates.service.js'

describe('Licences - End Dates - Check All Licence End Dates service', () => {
  const batchSize = 10

  let licences
  let notifierStub
  beforeEach(() => {
    licences = _licences()

    // NOTE: We set our batch size to ensure consistency within the tests. Depending on who or where the tests are being
    // run, might mean this value is different.
    vi.replaceProperty(LicencesConfig, 'endDates', { batchSize })

    vi.spyOn(FetchLicencesService, 'default').mockResolvedValue(licences)

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when processing the licences', () => {
    beforeEach(() => {
      vi.spyOn(CheckLicenceEndDatesService, 'default').mockResolvedValue()
    })

    it('processes all licences with a current licence version in NALD and a matching record in WRLS', async () => {
      await CheckAllLicenceEndDatesService()

      const firstLicence = licences[0]
      const lastLicence = licences[licences.length - 1]

      expect(CheckLicenceEndDatesService.default).toHaveBeenCalledTimes(licences.length)
      expect(CheckLicenceEndDatesService.default.mock.calls[0][0]).toEqual(firstLicence)
      expect(CheckLicenceEndDatesService.default.mock.calls[licences.length - 1][0]).toEqual(lastLicence)
    })

    it('processes them in batches', async () => {
      await CheckAllLicenceEndDatesService()

      // Check the expected number of batches (100 items / 10 per batch = 10 batches)
      const expectedBatches = Math.ceil(licences.length / batchSize)

      expect(CheckLicenceEndDatesService.default.mock.calls.length / batchSize).toEqual(expectedBatches)
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await CheckAllLicenceEndDatesService()

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Check all licence end dates complete', expect.any(Object))
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.count).toBeDefined()
    })
  })

  // NOTE: We've gone to the effort of batching the work to ensure the total time is not 'number of licences * time to
  // process one licence'!
  //
  // This handy test is a great way of demonstrating that batching the work reduces the overall time it takes to
  // complete the job. We make it so that each licence takes 0.25 seconds to complete. Processing 100 licences in
  // batches of 10 should mean the overall time is around 2.5 seconds.
  //
  // This is because with the help of p-map each batch is processing 10 licences asynchronously. This means a batch
  // should take approximately the same time to complete as processing a single licence. So, the overall time is
  // 10 x 0.25 seconds.
  describe('when batching the processing of the licences', () => {
    beforeEach(() => {
      const delayInMilliseconds = 250 // 0.25 seconds

      vi.spyOn(CheckLicenceEndDatesService, 'default').mockImplementation(() => {
        return pause(delayInMilliseconds)
      })
    })

    it('takes less time to complete the job than doing them one at a time', { timeout: 4000 }, async () => {
      await CheckAllLicenceEndDatesService()

      const args = notifierStub.omg.mock.calls[0]

      expect(args[1].timeTakenSs).toBeLessThan(3n)
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      vi.spyOn(CheckLicenceEndDatesService, 'default').mockRejectedValue(new Error())
    })

    it('handles the error', async () => {
      await CheckAllLicenceEndDatesService()

      const args = notifierStub.omfg.mock.calls[0]

      expect(args[0]).toEqual('Check all licence end dates failed')
      expect(args[1]).toBeNull()
      expect(args[2]).toBeInstanceOf(Error)
    })
  })
})

function _licences() {
  const licences = []

  for (let i = 0; i < 100; i++) {
    licences.push({
      id: generateUUID(),
      nald_expired_date: null,
      nald_lapsed_date: null,
      nald_revoked_date: null,
      wrls_expired_date: null,
      wrls_lapsed_date: null,
      wrls_revoked_date: null
    })
  }

  return licences
}
