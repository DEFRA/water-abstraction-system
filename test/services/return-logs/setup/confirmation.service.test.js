'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ConfirmationService = require('../../../../app/services/return-logs/setup/confirmation.service.js')

describe('Return Logs Setup - Confirmation service', () => {
  let session

  before(async () => {
    session = await SessionHelper.add({
      data: {
        licenceId: '736144f1-203d-46bb-9968-5137ae06a7bd',
        licenceRef: '01/01',
        returnLogId: 'v1:6:01/01:10059108:2023-04-01:2024-03-31',
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-03-31'),
        returnReference: '10059108',
        underQuery: false,
        periodStartDay: 1,
        periodStartMonth: 1,
        periodEndDay: 31,
        periodEndMonth: 12,
        siteDescription: 'Addington Sandpits',
        purposes: 'Mineral Washing',
        twoPartTariff: false
      },
      id: 'd958333a-4acd-4add-9e2b-09e14c6b72f3'
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await ConfirmationService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await ConfirmationService.go(session.id)

      expect(result).to.equal(
        {
          activeNavBar: 'search',
          pageTitle: 'Query resolved',
          licenceId: '736144f1-203d-46bb-9968-5137ae06a7bd',
          licenceRef: '01/01',
          returnLog: {
            returnLogId: 'v1:6:01/01:10059108:2023-04-01:2024-03-31',
            purposes: 'Mineral Washing',
            siteDescription: 'Addington Sandpits'
          }
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
