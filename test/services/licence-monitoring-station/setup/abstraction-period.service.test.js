'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const AbstractionPeriodService = require('../../../../app/services/licence-monitoring-station/setup/abstraction-period.service.js')

describe('Licence Monitoring Station Setup - Abstraction Period Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      label: 'FRENCHAY',
      licenceRef: '01/115',
      abstractionPeriodStartDay: '1',
      abstractionPeriodStartMonth: '2',
      abstractionPeriodEndDay: '3',
      abstractionPeriodEndMonth: '4'
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await AbstractionPeriodService.go(session.id)

      expect(result).to.equal({
        abstractionPeriodStartDay: '1',
        abstractionPeriodEndDay: '3',
        abstractionPeriodStartMonth: '2',
        abstractionPeriodEndMonth: '4',
        activeNavBar: 'search',
        backLink: {
          href: `/system/licence-monitoring-station/setup/${session.id}/full-condition`,
          text: 'Back'
        },
        monitoringStationLabel: 'FRENCHAY',
        pageTitle: 'Enter an abstraction period for licence 01/115'
      })
    })
  })
})
