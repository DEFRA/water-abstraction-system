'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReturnsPeriodService = require('../../../../app/services/notifications/setup/returns-period.service.js')

describe('Notifications Setup - Returns Period service', () => {
  describe('when provided no params', () => {
    it('correctly presents the data', () => {
      const result = ReturnsPeriodService.go()

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: '/manage',
        pageTitle: 'Select which returns period to send invitations for',
        returnsPeriod: []
      })
    })
  })
})
