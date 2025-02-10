'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitRemoveLicencesService = require('../../../../app/services/notifications/setup/submit-remove-licences.service.js')

describe('Notifications Setup - Submit Remove licences service', () => {
  let payload
  let session

  describe('when submitting licences to remove ', () => {
    describe('is successful', () => {
      beforeEach(async () => {
        session = await SessionHelper.add()

        payload = { removeLicences: '1234' }
      })

      it('saves the submitted value', async () => {
        await SubmitRemoveLicencesService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.removeLicences).to.equal(['1234'])
      })

      it('returns the redirect route', async () => {
        const result = await SubmitRemoveLicencesService.go(session.id, payload)

        expect(result).to.equal({
          redirect: `${session.id}/review`
        })
      })
    })

    describe('fails validation', () => {
      beforeEach(async () => {
        session = await SessionHelper.add()
        payload = { removeLicences: '1234 567' }
      })

      it('correctly presents the data with the error', async () => {
        const result = await SubmitRemoveLicencesService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'manage',
          error: {
            text: 'Separate the licence numbers with a comma or new line'
          },
          hint: 'Separate the licences numbers with a comma or new line.',
          removeLicences: '1234 567',
          pageTitle: 'Enter the licence numbers to remove from the mailing list'
        })
      })
    })
  })
})
