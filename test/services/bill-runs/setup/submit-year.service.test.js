'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitYearService = require('../../../../app/services/bill-runs/setup/submit-year.service.js')

describe('Bill Runs Setup Submit Year service', () => {
  let payload
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({ data: {} })
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

          expect(refreshedSession.data.year).to.equal('2023')
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

          expect(refreshedSession.data.year).to.equal('2022')
          expect(result.setupComplete).to.be.false()
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(async () => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitYearService.go(session.id, payload)

          expect(result).to.equal({
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
