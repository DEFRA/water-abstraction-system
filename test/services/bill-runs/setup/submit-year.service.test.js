'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchLicenceSupplementaryYearsService = require('../../../../app/services/bill-runs/setup/fetch-licence-supplementary-years.service.js')

// Thing under test
const SubmitYearService = require('../../../../app/services/bill-runs/setup/submit-year.service.js')

describe('Bill Runs - Setup - Submit Year service', () => {
  let payload
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: {} })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('and the year is in the SROC period', () => {
        beforeEach(() => {
          payload = {
            year: '2023'
          }
        })

        it('saves the submitted value and returns an object confirming setup is complete', async () => {
          const result = await SubmitYearService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.year).to.equal('2023')
          expect(result.setupComplete).to.be.true()
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

          const refreshedSession = await session.$query()

          expect(refreshedSession.year).to.equal('2022')
          expect(result.setupComplete).to.be.false()
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        const regionId = 'cff057a0-f3a7-4ae6-bc2b-01183e40fd05'

        let yearsStub

        beforeEach(async () => {
          session = await SessionHelper.add({ data: { region: regionId, type: 'two_part_supplementary' } })
          payload = {}
          yearsStub = Sinon.stub(FetchLicenceSupplementaryYearsService, 'go').resolves([{ financialYearEnd: 2024 }])
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitYearService.go(session.id, payload)

          expect(yearsStub.calledWith(regionId, true)).to.be.true()

          expect(result).to.equal({
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
