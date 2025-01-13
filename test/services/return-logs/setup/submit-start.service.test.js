'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitStartService = require('../../../../app/services/return-logs/setup/submit-start.service.js')

describe('Return Logs Setup - Submit Start service', () => {
  let payload
  let session

  beforeEach(async () => {
    session = await _session()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { whatToDo: 'enterReturn' }
      })

      it('saves and returns the submitted option', async () => {
        await SubmitStartService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.whatToDo).to.equal('enterReturn')
      })
    })

    describe('with an invalid payload because the user has not selected anything', () => {
      beforeEach(() => {
        payload = {}
      })

      it('includes an error for the radio form element', async () => {
        const result = await SubmitStartService.go(session.id, payload)

        expect(result.error).to.equal({ text: 'Select what you want to do with this return' })
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitStartService.go(session.id, payload)

        expect(result).to.equal({
          error: { text: 'Select what you want to do with this return' },
          abstractionPeriod: 'From 1 January to 31 December',
          displayRecordReceipt: true,
          licenceId: 'db3731ae-3dde-4778-a81e-9be549cfc0e1',
          licenceRef: '01/111',
          pageTitle: 'Abstraction return',
          purposes: 'Evaporative Cooling',
          returnLogId: 'v1:6:01/111:2222:2022-04-01:2005-03-31',
          returnsPeriod: 'From 1 April 2022 to 31 March 2023',
          returnReference: '1234',
          selectedOption: null,
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
      status: 'due',
      dueDate: new Date('2023-04-28'),
      endDate: new Date('2023-03-31'),
      purposes: 'Evaporative Cooling',
      licenceId: 'db3731ae-3dde-4778-a81e-9be549cfc0e1',
      startDate: new Date('2022-04-01'),
      licenceRef: '01/111',
      underQuery: false,
      returnLogId: 'v1:6:01/111:2222:2022-04-01:2005-03-31',
      periodEndDay: 31,
      receivedDate: null,
      twoPartTariff: false,
      periodEndMonth: 12,
      periodStartDay: 1,
      returnReference: '1234',
      siteDescription: 'POINT A, TIDAL RIVER MEDWAY AT ISLE OF GRAIN',
      periodStartMonth: 1
    }
  })

  return session
}
