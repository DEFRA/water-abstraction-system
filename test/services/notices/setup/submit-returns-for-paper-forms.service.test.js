'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const SubmitReturnsForPaperFormsService = require('../../../../app/services/notices/setup/submit-returns-for-paper-forms.service.js')

describe('Notices - Setup - Submit Returns For Paper Forms service', () => {
  let dueReturn
  let licenceRef
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    dueReturn = {
      description: 'Potable Water Supply - Direct',
      endDate: '2003-03-31',
      returnId: generateUUID(),
      returnReference: '3135',
      startDate: '2002-04-01'
    }

    payload = { returns: [dueReturn.returnId] }

    sessionData = { licenceRef }

    session = await SessionHelper.add({ data: sessionData })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the selected returns', async () => {
      await SubmitReturnsForPaperFormsService.go(session.id, payload, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession.selectedReturns).to.equal([dueReturn.returnId])
    })

    it('continues the journey', async () => {
      const result = await SubmitReturnsForPaperFormsService.go(session.id, payload, yarStub)

      expect(result).to.equal({})
    })

    describe('and the payload has one item (is not an array)', () => {
      beforeEach(async () => {
        payload = { returns: dueReturn.returnId }
        sessionData = {}

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the selected returns', async () => {
        await SubmitReturnsForPaperFormsService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.selectedReturns).to.equal([dueReturn.returnId])
      })
    })

    describe('from the check page', () => {
      describe('and the returns have been updated', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { checkPageVisited: true, selectedReturns: [generateUUID()] } })
        })

        it('sets a flash message', async () => {
          await SubmitReturnsForPaperFormsService.go(session.id, payload, yarStub)

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(bannerMessage).to.equal({
            text: 'Returns updated',
            title: 'Updated'
          })
        })
      })

      describe('and the returns have not been updated', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { checkPageVisited: true, selectedReturns: [dueReturn.returnId] } })
        })

        it('does not set a flash message', async () => {
          await SubmitReturnsForPaperFormsService.go(session.id, payload, yarStub)

          expect(yarStub.flash.args[0]).to.be.undefined()
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}

      sessionData = { licenceRef, dueReturns: [dueReturn] }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitReturnsForPaperFormsService.go(session.id, payload, yarStub)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/notice-type`,
        error: {
          text: 'Select the returns for the paper forms'
        },

        pageTitle: 'Select the returns for the paper forms',
        returns: [
          {
            checked: false,
            hint: {
              text: '1 April 2002 to 31 March 2003'
            },
            text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
            value: dueReturn.returnId
          }
        ]
      })
    })
  })
})
