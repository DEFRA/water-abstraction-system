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
const SubmitTypeService = require('../../../../app/services/bill-runs/setup/submit-type.service.js')

describe('Bill Runs - Setup - Submit Type service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          type: 'annual'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitTypeService.go(session.id, payload)

        expect(session.type).to.equal('annual')
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitTypeService.go(session.id, payload)

        expect(result).to.equal({})
        expect(session.$update.called).to.be.true()
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitTypeService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'bill-runs',
            backlink: '/system/bill-runs',
            error: {
              text: 'Select the bill run type'
            },
            pageTitle: 'Select the bill run type',
            sessionId: session.id,
            selectedType: null
          })
        })
      })
    })
  })
})
