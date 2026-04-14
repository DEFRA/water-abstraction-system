'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const VolumesService = require('../../../../app/services/return-logs/setup/volumes.service.js')

describe('Return Logs Setup - Volumes service', () => {
  const yearMonth = '2023-3'

  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      lines: [
        {
          endDate: '2023-04-30T00:00:00.000Z',
          quantity: 100,
          startDate: '2023-04-01T00:00:00.000Z'
        },
        {
          endDate: '2023-05-31T00:00:00.000Z',
          startDate: '2023-05-01T00:00:00.000Z'
        }
      ],
      returnsFrequency: 'month',
      returnReference: '1234',
      units: 'cubicMetres'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await VolumesService.go(session.id, yearMonth)

      expect(result).to.equal({
        backLink: { href: `/system/return-logs/setup/${session.id}/check`, text: 'Back' },
        inputLines: [
          {
            endDate: '2023-04-30T00:00:00.000Z',
            label: 'April 2023',
            quantity: '100',
            viewId: 'April2023'
          }
        ],
        pageTitle: 'Water abstracted April 2023',
        pageTitleCaption: 'Return reference 1234',
        units: 'Cubic metres'
      })
    })
  })
})
