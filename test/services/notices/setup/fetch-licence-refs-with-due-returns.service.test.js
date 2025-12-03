'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things to stub
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

// Thing under test
const FetchLicenceRefsWithDueReturnsService = require('../../../../app/services/notices/setup/fetch-licence-refs-with-due-returns.service.js')

describe('Notices - Setup - Fetch Licence Refs With Due Returns service', () => {
  const returnsPeriod = {
    endDate: new Date('2025-03-31'),
    startDate: new Date('2024-04-01'),
    summer: false
  }

  let distinctInvitationLicenceRef
  let distinctReminderLicenceRef
  let noticeType
  let returnLogs

  before(async () => {
    // Start with the helper defaults, set to match the period we are interested in
    const defaultDates = { endDate: returnsPeriod.endDate, startDate: returnsPeriod.startDate }

    returnLogs = []

    // RETURNS INVITATIONS - These have null due dates so would be considered when notice type is 'invitations'

    // 0 & 1) Add two 'due' return logs with the same dates and same licence refs. This will confirm licence refs are
    // DISTINCT in the results
    distinctInvitationLicenceRef = generateLicenceRef()
    await _addReturnLog(returnLogs, { ...defaultDates, licenceRef: distinctInvitationLicenceRef })
    await _addReturnLog(returnLogs, { ...defaultDates, licenceRef: distinctInvitationLicenceRef })

    // 2) Another 'due' return log in the returns period with a null due date, with a different licence ref
    await _addReturnLog(returnLogs, { ...defaultDates })

    // 3) Add a 'due' return log WITHIN the returns period but the cycle doesn't match
    await _addReturnLog(returnLogs, { ...defaultDates, metadata: { isCurrent: true, isSummer: true } })

    // 4) Add a 'due' return log WITHIN the returns period but the status is not 'due'
    await _addReturnLog(returnLogs, { ...defaultDates, status: 'void' })

    // 5) Add a 'due' return log WITHIN the returns period but the isCurrent flag is false
    await _addReturnLog(returnLogs, { ...defaultDates, metadata: { isCurrent: false, isSummer: false } })

    // 6) Add a 'due' return log OUTSIDE of the returns period to confirm it is NOT included in results
    await _addReturnLog(returnLogs, { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') })

    // RETURNS REMINDERS - These have populated due dates so would be considered when notice type is 'reminders'.
    // We don't reproduce _all_ the return logs above as the only change to the query relevant to the notice type is
    // whether the due date is null or populated. We're satisfied those other criteria are covered above.

    // 7 & 8) Add two 'due' return logs with the same dates and same licence refs. This will confirm licence refs are
    // DISTINCT in the results
    distinctReminderLicenceRef = generateLicenceRef()
    const dueDate = new Date('2025-04-28')
    await _addReturnLog(returnLogs, { ...defaultDates, dueDate, licenceRef: distinctReminderLicenceRef })
    await _addReturnLog(returnLogs, { ...defaultDates, dueDate, licenceRef: distinctReminderLicenceRef })

    // 9) Another 'due' return log in the returns period with a populated due date, with a different licence ref
    await _addReturnLog(returnLogs, { ...defaultDates, dueDate })
  })

  beforeEach(async () => {
    Sinon.stub(FeatureFlagsConfig, 'enableNullDueDate').value(true)
  })

  afterEach(async () => {
    Sinon.restore()
  })

  after(async () => {
    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }
  })

  describe('when the notice type is "invitations"', () => {
    beforeEach(() => {
      noticeType = 'invitations'
    })

    it('correctly returns the expected licence refs', async () => {
      const results = await FetchLicenceRefsWithDueReturnsService.go(returnsPeriod, noticeType)

      expect(results).to.include(distinctInvitationLicenceRef)
      expect(results).to.include(returnLogs[2].licenceRef)

      expect(results).to.not.include(returnLogs[3].licenceRef)
      expect(results).to.not.include(returnLogs[4].licenceRef)
      expect(results).to.not.include(returnLogs[5].licenceRef)
      expect(results).to.not.include(returnLogs[6].licenceRef)

      expect(results).to.not.include(distinctReminderLicenceRef)
      expect(results).to.not.include(returnLogs[9].licenceRef)
    })

    it('returns a distinct list of licence refs', async () => {
      const results = await FetchLicenceRefsWithDueReturnsService.go(returnsPeriod, noticeType)

      const knownDuplicateLicenceRef = results.filter((licenceRef) => {
        return licenceRef === distinctInvitationLicenceRef
      })

      expect(knownDuplicateLicenceRef).have.length(1)
    })
  })

  describe('when the notice type is "reminders"', () => {
    beforeEach(() => {
      noticeType = 'reminders'
    })

    it('correctly returns the expected licence refs', async () => {
      const results = await FetchLicenceRefsWithDueReturnsService.go(returnsPeriod, noticeType)

      expect(results).to.include(distinctReminderLicenceRef)
      expect(results).to.include(returnLogs[8].licenceRef)

      expect(results).to.not.include(distinctInvitationLicenceRef)
      expect(results).to.not.include(returnLogs[2].licenceRef)
      expect(results).to.not.include(returnLogs[3].licenceRef)
      expect(results).to.not.include(returnLogs[4].licenceRef)
      expect(results).to.not.include(returnLogs[5].licenceRef)
      expect(results).to.not.include(returnLogs[6].licenceRef)
    })

    it('returns a distinct list of licence refs', async () => {
      const results = await FetchLicenceRefsWithDueReturnsService.go(returnsPeriod, noticeType)

      const knownDuplicateLicenceRef = results.filter((licenceRef) => {
        return licenceRef === distinctReminderLicenceRef
      })

      expect(knownDuplicateLicenceRef).have.length(1)
    })
  })
})

async function _addReturnLog(returnLogs, overrides) {
  const returnLog = await ReturnLogHelper.add(overrides)

  returnLogs.push(returnLog)

  return returnLog
}
