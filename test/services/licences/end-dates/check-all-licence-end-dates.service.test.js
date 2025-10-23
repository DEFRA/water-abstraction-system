'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchLicencesService = require('../../../../app/services/licences/end-dates/fetch-licences.service.js')
const LicencesConfig = require('../../../../config/licences.config.js')
const CheckLicenceEndDatesService = require('../../../../app/services/licences/end-dates/check-licence-end-dates.service.js')
const { generateUUID, pause } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CheckAllLicenceEndDatesService = require('../../../../app/services/licences/end-dates/check-all-licence-end-dates.service.js')

describe('Licences - End Dates - Check All Licence End Dates service', () => {
  const batchSize = 10

  let licences
  let notifierStub
  let processLicenceStub

  beforeEach(() => {
    licences = _licences()

    // NOTE: We set our batch size to ensure consistency within the tests. Depending on who or where the tests are being
    // run, might mean this value is different.
    Sinon.stub(LicencesConfig, 'endDates').value({ batchSize })

    Sinon.stub(FetchLicencesService, 'go').resolves(licences)

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when processing the licences', () => {
    beforeEach(() => {
      processLicenceStub = Sinon.stub(CheckLicenceEndDatesService, 'go').resolves()
    })

    it('processes all licences with a current licence version in NALD and a matching record in WRLS', async () => {
      await CheckAllLicenceEndDatesService.go()

      const firstLicence = licences[0]
      const lastLicence = licences[licences.length - 1]

      expect(processLicenceStub.callCount).to.equal(licences.length)
      expect(processLicenceStub.getCall(0).firstArg).to.equal(firstLicence)
      expect(processLicenceStub.getCall(licences.length - 1).firstArg).to.equal(lastLicence)
    })

    it('processes them in batches', async () => {
      await CheckAllLicenceEndDatesService.go()

      // Check the expected number of batches (100 items / 10 per batch = 10 batches)
      const expectedBatches = Math.ceil(licences.length / batchSize)

      expect(processLicenceStub.getCalls().length / batchSize).to.equal(expectedBatches)
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await CheckAllLicenceEndDatesService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Check all licence end dates complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.count).to.exist()
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

      processLicenceStub = Sinon.stub(CheckLicenceEndDatesService, 'go').callsFake(() => {
        return pause(delayInMilliseconds)
      })
    })

    it('takes less time to complete the job than doing them one at a time', { timeout: 4000 }, async () => {
      await CheckAllLicenceEndDatesService.go()

      const args = notifierStub.omg.firstCall.args

      expect(args[1].timeTakenSs).to.be.lessThan(3n)
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      Sinon.stub(CheckLicenceEndDatesService, 'go').rejects()
    })

    it('handles the error', async () => {
      await CheckAllLicenceEndDatesService.go()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Check all licence end dates failed')
      expect(args[1]).to.be.null()
      expect(args[2]).to.be.an.error()
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
