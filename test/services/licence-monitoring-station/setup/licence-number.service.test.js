'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const LicenceNumberService = require('../../../../app/services/licence-monitoring-station/setup/licence-number.service.js')

describe('Licence Monitoring Station Setup - Licence Number Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      label: 'MONITORING_STATION_LABEL',
      licenceRef: 'LICENCE_REF',
      checkPageVisited: false
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await LicenceNumberService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: `/system/licence-monitoring-station/setup/${session.id}/stop-or-reduce`,
        licenceRef: 'LICENCE_REF',
        monitoringStationLabel: 'MONITORING_STATION_LABEL',
        pageTitle: 'Enter the licence number this threshold applies to'
      })
    })
  })
})
