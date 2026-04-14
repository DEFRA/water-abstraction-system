'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SingleVolumeService = require('../../../../app/services/return-logs/setup/single-volume.service.js')

describe('Return Logs Setup - Single Volume service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      returnReference: '012345',
      units: 'cubicMetres'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await SingleVolumeService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await SingleVolumeService.go(session.id)

      expect(result).to.equal(
        {
          backLink: { href: `/system/return-logs/setup/${session.id}/meter-provided`, text: 'Back' },
          pageTitle: 'Is it a single volume?',
          pageTitleCaption: 'Return reference 012345',
          singleVolume: null,
          singleVolumeQuantity: null,
          units: 'cubic metres'
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
