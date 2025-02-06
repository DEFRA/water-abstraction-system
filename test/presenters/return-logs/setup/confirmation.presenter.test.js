'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ConfirmationPresenter = require('../../../../app/presenters/return-logs/setup/confirmation.presenter.js')

describe('Return Logs Setup - Confirmation presenter', () => {
  let session

  beforeEach(() => {
    session = {
      beenReceived: false,
      confirmationPageVisited: true,
      createdAt: '2025-02-06T12:14:21.212Z',
      dueDate: '2019-06-09T00:00:00.000Z',
      endDate: '2019-05-12T00:00:00.000Z',
      id: 'e840675e-9fb9-4ce1-bf0a-d140f5c57f47',
      journey: 'record-receipt',
      licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
      licenceRef: '01/117',
      periodEndDay: 30,
      periodEndMonth: 9,
      periodStartDay: 1,
      periodStartMonth: 10,
      purposes: 'Mineral Washing',
      receivedDate: '2025-02-05T00:00:00.000Z',
      receivedDateOptions: 'yesterday',
      returnLogId: 'v1:6:01/117:10032788:2019-04-01:2019-05-12',
      returnReference: '10032788',
      siteDescription: 'Addington Sandpits',
      startDate: '2019-04-01T00:00:00.000Z',
      status: 'due',
      twoPartTariff: false,
      underQuery: false,
      updatedAt: '2025-02-06T12:14:21.212Z'
    }
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data', () => {
      const result = ConfirmationPresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/licences/91aff99a-3204-4727-86bd-7bdf3ef24533/returns',
        licenceRef: '01/117',
        pageTitle: 'Return 10032788 received',
        purposes: 'Mineral Washing',
        sessionId: session.id,
        siteDescription: 'Addington Sandpits'
      })
    })
  })
})
