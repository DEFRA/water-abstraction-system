'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitTypeService = require('../../../../app/services/bill-runs/setup/submit-type.service.js')

describe('Submit No Returns Required service', () => {
  let payload
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({ data: {} })
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

        const refreshedSession = await session.$query()

        expect(refreshedSession.data.type).to.equal('annual')
      })

      it('returns an empty object (no page data is needed for a redirect)', async () => {
        const result = await SubmitTypeService.go(session.id, payload)

        expect(result).to.equal({})
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
            sessionId: session.id,
            selectedType: null,
            error: {
              text: 'Select a bill run type'
            }
          })
        })
      })
    })
  })
})
