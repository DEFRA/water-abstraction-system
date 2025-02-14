'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FetchReturnsDueService = require('../../../../app/services/notifications/setup/fetch-returns-due.service.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitRemoveLicencesService = require('../../../../app/services/notifications/setup/submit-remove-licences.service.js')

describe('Notifications Setup - Submit Remove licences service', () => {
  const year = 2025

  let clock
  let payload
  let session
  let validLicences
  let fetchReturnsDueServiceStub

  before(() => {
    clock = Sinon.useFakeTimers(new Date(`${year}-01-01`))
  })

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { returnsPeriod: 'quarterFour' } })

    validLicences = [{ licenceRef: '1234' }]

    fetchReturnsDueServiceStub = Sinon.stub(FetchReturnsDueService, 'go')
  })

  afterEach(() => {
    clock.restore()
    fetchReturnsDueServiceStub.restore()
  })

  describe('when submitting licences to remove ', () => {
    describe('is successful', () => {
      beforeEach(async () => {
        payload = { removeLicences: '1234' }

        fetchReturnsDueServiceStub.resolves(validLicences)
      })

      it('saves the submitted value', async () => {
        await SubmitRemoveLicencesService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.removeLicences).to.equal('1234')
      })

      it('returns the redirect route', async () => {
        const result = await SubmitRemoveLicencesService.go(session.id, payload)

        expect(result).to.equal({
          redirect: `${session.id}/check`
        })
      })
    })

    describe('fails validation', () => {
      beforeEach(async () => {
        payload = { removeLicences: '789' }

        validLicences = []

        fetchReturnsDueServiceStub.resolves([validLicences])
      })

      it('correctly presents the data with the error', async () => {
        const result = await SubmitRemoveLicencesService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'manage',
          error: {
            text: 'There are no returns due for licence 789'
          },
          hint: 'Separate the licences numbers with a comma or new line.',
          removeLicences: '789',
          pageTitle: 'Enter the licence numbers to remove from the mailing list'
        })
      })
    })
  })
})
