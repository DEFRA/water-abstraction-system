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
const SubmitSingleVolumeService = require('../../../../app/services/return-logs/setup/submit-single-volume.service.js')

describe('Return Logs Setup - Submit Single Volume service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      returnReference: '12345',
      units: 'litres'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = { singleVolume: 'yes', singleVolumeQuantity: '1000' }
      })

      it('saves the submitted option', async () => {
        await SubmitSingleVolumeService.go(session.id, payload)

        expect(session.singleVolume).to.equal('yes')
        expect(session.singleVolumeQuantity).to.equal(1000)

        expect(session.$update.called).to.be.true()
      })

      describe('and the user has previously selected "yes" to a single volume being provided', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitSingleVolumeService.go(session.id, payload)

          expect(result).to.equal({ singleVolume: 'yes' })
        })
      })

      describe('and the user has previously selected "no" to a single volume being provided', () => {
        beforeEach(() => {
          payload = { singleVolume: 'no' }
        })

        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitSingleVolumeService.go(session.id, payload)

          expect(result).to.equal({ singleVolume: 'no' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitSingleVolumeService.go(session.id, payload)

        expect(result).to.equal(
          {
            backLink: { href: `/system/return-logs/setup/${session.id}/meter-provided`, text: 'Back' },
            pageTitle: 'Is it a single volume?',
            pageTitleCaption: 'Return reference 12345',
            singleVolume: null,
            singleVolumeQuantity: null,
            units: 'litres'
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitSingleVolumeService.go(session.id, payload)

          expect(result.error).to.equal({
            errorList: [{ href: '#singleVolume', text: "Select if it's a single volume" }],
            singleVolume: { text: "Select if it's a single volume" }
          })
        })
      })

      describe('because the user entered an invalid volume', () => {
        beforeEach(() => {
          payload.singleVolume = 'yes'
          payload.singleVolumeQuantity = '-1'
        })

        it('includes an error for the input form element', async () => {
          const result = await SubmitSingleVolumeService.go(session.id, payload)

          expect(result.error).to.equal({
            errorList: [{ href: '#singleVolumeQuantity', text: 'Enter a total amount greater than zero' }],
            singleVolumeQuantity: { text: 'Enter a total amount greater than zero' }
          })
        })
      })
    })
  })
})
