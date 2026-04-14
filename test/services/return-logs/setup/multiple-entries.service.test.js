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
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const MultipleEntriesService = require('../../../../app/services/return-logs/setup/multiple-entries.service.js')

describe('Return Logs Setup - Multiple Entries service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      returnReference: '012345',
      lines: [
        { startDate: new Date('2023-04-01').toISOString(), endDate: new Date('2023-04-30').toISOString() },
        { startDate: new Date('2023-05-01').toISOString(), endDate: new Date('2023-05-31').toISOString() }
      ],
      returnsFrequency: 'month',
      reported: 'abstractionVolumes'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await MultipleEntriesService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await MultipleEntriesService.go(session.id)

      expect(result).to.equal(
        {
          backLink: {
            href: `/system/return-logs/setup/${session.id}/check`,
            text: 'Back'
          },
          endDate: '1 May 2023',
          frequency: 'monthly',
          lineCount: 2,
          measurementType: 'volumes',
          multipleEntries: null,
          pageTitle: 'Enter multiple monthly volumes',
          pageTitleCaption: 'Return reference 012345',
          startDate: '1 April 2023'
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
