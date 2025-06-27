'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const SubmitReturnsForPaperFormsService = require('../../../../app/services/notices/setup/submit-returns-for-paper-forms.service.js')

describe('Notices - Setup - Returns For Paper Forms Service', () => {
  let licenceRef
  let returnLog
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    returnLog = await ReturnLogHelper.add({
      licenceRef,
      metadata: {
        purposes: [
          {
            tertiary: { description: 'Potable Water Supply - Direct' }
          }
        ]
      }
    })

    payload = { returns: [returnLog.returnReference] }

    sessionData = { licenceRef }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the selected returns', async () => {
      await SubmitReturnsForPaperFormsService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.selectedReturns).to.equal([returnLog.returnReference])
    })

    it('continues the journey', async () => {
      const result = await SubmitReturnsForPaperFormsService.go(session.id, payload)

      expect(result).to.equal({})
    })

    describe('and the payload has one item (is not an array)', () => {
      beforeEach(async () => {
        payload = { returns: returnLog.returnReference }
        sessionData = {}

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the selected returns', async () => {
        await SubmitReturnsForPaperFormsService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.selectedReturns).to.equal([returnLog.returnReference])
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
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
              text: '1 April 2022 to 31 March 2023'
            },
            text: `${returnLog.returnReference} Potable Water Supply - Direct`,
            value: `${returnLog.returnReference}`
          }
        ]
      })
    })
  })
})
