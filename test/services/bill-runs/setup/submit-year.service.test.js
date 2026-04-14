'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchLicenceSupplementaryYearsService = require('../../../../app/services/bill-runs/setup/fetch-licence-supplementary-years.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitYearService = require('../../../../app/services/bill-runs/setup/submit-year.service.js')

describe('Bill Runs - Setup - Submit Year service', () => {
  let fetchSessionStub
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and the year is in the SROC period', () => {
        beforeEach(() => {
          payload = {
            year: '2026'
          }
        })

        it('saves the submitted value and returns an object confirming setup is complete', async () => {
          const result = await SubmitYearService.go(session.id, payload)

          expect(session.year).to.equal('2026')
          expect(result.setupComplete).to.be.true()
          expect(session.$update.called).to.be.true()
        })
      })

      describe('and the year is in the PRESROC period', () => {
        beforeEach(() => {
          payload = {
            year: '2022'
          }
        })

        it('saves the submitted value and returns an object confirming setup is not complete', async () => {
          const result = await SubmitYearService.go(session.id, payload)

          expect(session.year).to.equal('2022')
          expect(result.setupComplete).to.be.false()

          expect(session.$update.called).to.be.true()
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        const regionId = 'cff057a0-f3a7-4ae6-bc2b-01183e40fd05'

        let yearsStub

        beforeEach(() => {
          sessionData = { region: regionId, type: 'two_part_supplementary' }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
          payload = {}
          yearsStub = Sinon.stub(FetchLicenceSupplementaryYearsService, 'go').resolves([{ financialYearEnd: 2024 }])
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitYearService.go(session.id, payload)

          expect(yearsStub.calledWith(regionId, true)).to.be.true()

          expect(result).to.equal({
            activeNavBar: 'bill-runs',
            backlink: `/system/bill-runs/setup/${session.id}/region`,
            financialYearsData: [{ text: '2023 to 2024', value: 2024, checked: false }],
            pageTitle: 'Select the financial year',
            sessionId: session.id,
            selectedYear: null,
            error: {
              text: 'Select the financial year'
            }
          })
        })
      })
    })
  })
})
