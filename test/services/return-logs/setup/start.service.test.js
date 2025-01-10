'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const StartService = require('../../../../app/services/return-logs/setup/start.service.js')

describe('Return Logs Setup - Start service', () => {
  let sessionId

  before(async () => {
    const session = await _session()
    sessionId = session.id
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await StartService.go(sessionId)

      expect(result).to.equal({
        abstractionPeriod: 'From 1 January to 31 December',
        displayRecordReceipt: true,
        licenceId: 'db3731ae-3dde-4778-a81e-9be549cfc0e1',
        licenceRef: '01/111',
        pageTitle: 'Abstraction return',
        purposes: 'Evaporative Cooling',
        returnLogId: 'v1:6:01/111:2222:2022-04-01:2005-03-31',
        returnsPeriod: 'From 1 April 2022 to 31 March 2023',
        returnReference: '1234',
        selectedOption: undefined,
        siteDescription: 'POINT A, TIDAL RIVER MEDWAY AT ISLE OF GRAIN',
        status: 'overdue',
        tariffType: 'Standard tariff'
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
