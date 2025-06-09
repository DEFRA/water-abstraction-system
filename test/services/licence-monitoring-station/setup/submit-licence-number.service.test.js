'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitLicenceNumberService = require('../../../../app/services/licence-monitoring-station/setup/submit-licence-number.service.js')

describe('Licence Monitoring Station Setup - Licence Number Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = {}
    sessionData = {
      label: 'LABEL'
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    describe('and the licence exists', () => {
      let licence

      beforeEach(async () => {
        licence = await LicenceHelper.add()
        payload = { licenceRef: licence.licenceRef }
      })

      it('saves the submitted value', async () => {
        await SubmitLicenceNumberService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceRef).to.equal(payload.licenceRef)
      })

      it('saves the licence id', async () => {
        await SubmitLicenceNumberService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.licenceId).to.equal(licence.id)
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitLicenceNumberService.go(session.id, payload)

          expect(result).to.equal({
            checkPageVisited: undefined
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitLicenceNumberService.go(session.id, payload)

          expect(result).to.equal({
            checkPageVisited: true
          })
        })
      })
    })
  })

  describe('and the licence does not exist', () => {
    beforeEach(() => {
      payload = { licenceRef: '1234567890' }
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitLicenceNumberService.go(session.id, payload)

      expect(result).to.equal({
        activeNavBar: 'search',
        error: { text: 'Enter a valid licence number' },
        backLink: `/system/licence-monitoring-station/setup/${session.id}/stop-or-reduce`,
        monitoringStationLabel: 'LABEL',
        pageTitle: 'Enter the licence number this threshold applies to'
      })
    })
  })
})
