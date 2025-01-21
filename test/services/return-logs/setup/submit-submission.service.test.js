'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitSubmissionService = require('../../../../app/services/return-logs/setup/submit-submission.service.js')

describe('Return Logs Setup - Submit Submission service', () => {
  let payload
  let session

  beforeEach(async () => {
    session = await _session()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { journey: 'enter-return' }
      })

      it('saves and returns the submitted option', async () => {
        await SubmitSubmissionService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.journey).to.equal('enter-return')
      })
    })

    describe('with an invalid payload because the user has not selected anything', () => {
      beforeEach(() => {
        payload = {}
      })

      it('includes an error for the radio form element', async () => {
        const result = await SubmitSubmissionService.go(session.id, payload)

        expect(result.error).to.equal({ text: 'Select what you want to do with this return' })
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitSubmissionService.go(session.id, payload)

        expect(result).to.equal({
          abstractionPeriod: 'From 1 January to 31 December',
          activeNavBar: 'search',
          backLink: `/system/return-logs/setup/${session.id}/received`,
          beenReceived: false,
          error: { text: 'Select what you want to do with this return' },
          journey: null,
          licenceId: 'db3731ae-3dde-4778-a81e-9be549cfc0e1',
          licenceRef: '01/111',
          pageTitle: 'Abstraction return',
          purposes: 'Evaporative Cooling',
          returnsPeriod: 'From 1 April 2022 to 31 March 2023',
          returnReference: '1234',
          siteDescription: 'POINT A, TIDAL RIVER MEDWAY AT ISLE OF GRAIN',
          status: 'overdue',
          tariffType: 'Standard tariff'
        })
      })
    })
  })
})

async function _session() {
  const session = SessionHelper.add({
    data: {
      beenReceived: false,
      dueDate: '2023-04-28T00:00:00.000Z',
      endDate: '2023-03-31T00:00:00.000Z',
      licenceId: 'db3731ae-3dde-4778-a81e-9be549cfc0e1',
      licenceRef: '01/111',
      periodEndDay: 31,
      periodEndMonth: 12,
      periodStartDay: 1,
      periodStartMonth: 1,
      purposes: 'Evaporative Cooling',
      returnReference: '1234',
      siteDescription: 'POINT A, TIDAL RIVER MEDWAY AT ISLE OF GRAIN',
      startDate: '2022-04-01T00:00:00.000Z',
      status: 'due',
      twoPartTariff: false,
      underQuery: false
    }
  })

  return session
}
