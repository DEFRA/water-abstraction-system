'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchLicenceSupplementaryYearsService = require('../../../../app/services/bill-runs/setup/fetch-licence-supplementary-years.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const YearService = require('../../../../app/services/bill-runs/setup/year.service.js')

describe('Bill Runs - Setup - Year service', () => {
  const regionId = 'cff057a0-f3a7-4ae6-bc2b-01183e40fd05'

  let session
  let sessionData
  let yearsStub

  beforeEach(() => {
    sessionData = { region: regionId, type: 'two_part_supplementary', year: 2024 }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yearsStub = Sinon.stub(FetchLicenceSupplementaryYearsService, 'go').resolves([{ financialYearEnd: 2024 }])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await YearService(session.id)

      expect(yearsStub.calledWith(regionId, true)).toBe(true)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        backlink: `/system/bill-runs/setup/${session.id}/region`,
        financialYearsData: [{ text: '2023 to 2024', value: 2024, checked: true }],
        pageTitle: 'Select the financial year',
        sessionId: session.id,
        selectedYear: 2024
      })
    })
  })
})
