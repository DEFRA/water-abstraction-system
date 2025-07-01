'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const SubmitReturnsForPaperFormsService = require('../../../../app/services/notices/setup/submit-returns-for-paper-forms.service.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

describe('Notices - Setup - Submit Returns For Paper Forms Service', () => {
  let dueReturn
  let licenceRef
  let payload
  let session
  let sessionData

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
  })

  describe('when called', () => {
    it('saves the selected returns', async () => {
      await SubmitReturnsForPaperFormsService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.selectedReturns).to.equal([dueReturn.returnId])
    })

    it('continues the journey', async () => {
      const result = await SubmitReturnsForPaperFormsService.go(session.id, payload)

      expect(result).to.equal({})
    })

    describe('and the payload has one item (is not an array)', () => {
      beforeEach(async () => {
        payload = { returns: dueReturn.returnId }
        sessionData = {}

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the selected returns', async () => {
        await SubmitReturnsForPaperFormsService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.selectedReturns).to.equal([dueReturn.returnId])
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
      const result = await SubmitReturnsForPaperFormsService.go(session.id, payload)

      expect(result).to.equal({
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
