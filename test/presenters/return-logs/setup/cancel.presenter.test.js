'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CancelPresenter = require('../../../../app/presenters/return-logs/setup/cancel.presenter.js')

describe('Return Logs Setup - Cancel presenter', () => {
  let session

  beforeEach(() => {
    session = {
      endDate: '2005-03-31T00:00:00.000Z',
      id: 'e840675e-9fb9-4ce1-bf0a-d140f5c57f47',
      periodEndDay: 31,
      periodEndMonth: 12,
      periodStartDay: 1,
      periodStartMonth: 1,
      purposes: 'Evaporative Cooling',
      receivedDate: '2025-01-31T00:00:00.000Z',
      returnLogId: 'v1:6:09/999:1003992:2022-04-01:2023-03-31',
      returnReference: '1234',
      siteDescription: 'POINT A, TEST SITE DESCRIPTION',
      startDate: '2004-04-01T00:00:00.000Z',
      twoPartTariff: false
    }
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data', () => {
      const result = CancelPresenter.go(session)

      expect(result).to.equal({
        abstractionPeriod: '1 January to 31 December',
        backLink: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/check',
        pageTitle: 'You are about to cancel this return submission',
        purposes: 'Evaporative Cooling',
        returnLogId: 'v1:6:09/999:1003992:2022-04-01:2023-03-31',
        returnPeriod: '1 April 2004 to 31 March 2005',
        returnReceivedDate: '31 January 2025',
        caption: 'Return reference 1234',
        siteDescription: 'POINT A, TEST SITE DESCRIPTION',
        tariff: 'Standard'
      })
    })
  })

  describe('the "tariff" property', () => {
    describe('when the tariff is "Two-part"', () => {
      beforeEach(() => {
        session.twoPartTariff = true
      })

      it('returns the tariff as "Two-part"', () => {
        const result = CancelPresenter.go(session)

        expect(result.tariff).to.equal('Two-part')
      })
    })

    describe('when the tariff is "Standard"', () => {
      beforeEach(() => {
        session.twoPartTariff = false
      })

      it('returns the tariff as "Standard"', () => {
        const result = CancelPresenter.go(session)

        expect(result.tariff).to.equal('Standard')
      })
    })
  })
})
