'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewNotificationsValidator = require('../../../app/validators/notifications/view.validator.js')

describe.only('Notifications Report - filter validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = ViewNotificationsValidator.go({
        sentFromDay: '1',
        sentFromMonth: '4',
        sentFromYear: '2024',
        sentToDay: '28',
        sentToMonth: '4',
        sentToYear: '2024',
        sentBy: 'test@test.com'
      })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "sentFromDay" is given', () => {
      it('fails validation', () => {
        const result = ViewNotificationsValidator.go({
          sentFromMonth: '4',
          sentFromYear: '2025'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid from date')
      })
    })

    describe('because no "sentFromMonth" is given', () => {
      it('fails validation', () => {
        const result = ViewNotificationsValidator.go({
          sentFromDay: '4',
          sentFromYear: '2025'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid from date')
      })
    })

    describe('because no "sentFromYear" is given', () => {
      it('fails validation', () => {
        const result = ViewNotificationsValidator.go({
          sentFromDay: '4',
          sentFromMonth: '1'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid from date')
      })
    })

    describe('because no "sentToDay" is given', () => {
      it('fails validation', () => {
        const result = ViewNotificationsValidator.go({
          sentToMonth: '4',
          sentToYear: '2025'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid to date')
      })
    })

    describe('because no "sentToMonth" is given', () => {
      it('fails validation', () => {
        const result = ViewNotificationsValidator.go({
          sentToDay: '4',
          sentToYear: '2025'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid to date')
      })
    })

    describe('because no "sentToYear" is given', () => {
      it('fails validation', () => {
        const result = ViewNotificationsValidator.go({
          sentToDay: '4',
          sentToMonth: '1'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid to date')
      })
    })
  })
})
