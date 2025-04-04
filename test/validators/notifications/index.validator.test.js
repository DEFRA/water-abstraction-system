'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NotificationsIndexValidator = require('../../../app/validators/notifications/index.validator.js')

describe('Notifications Report - filter validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = NotificationsIndexValidator.go({
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
        const result = NotificationsIndexValidator.go({
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
        const result = NotificationsIndexValidator.go({
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
        const result = NotificationsIndexValidator.go({
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
        const result = NotificationsIndexValidator.go({
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
        const result = NotificationsIndexValidator.go({
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
        const result = NotificationsIndexValidator.go({
          sentToDay: '4',
          sentToMonth: '1'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid to date')
      })
    })

    describe('because an invalid empty string "sentToYear" is given', () => {
      it('fails validation', () => {
        const result = NotificationsIndexValidator.go({
          sentToDay: '4',
          sentToMonth: '1',
          sentToYear: ''
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid to date')
      })
    })

    describe('because an invalid null "sentToYear" is given', () => {
      it('fails validation', () => {
        const result = NotificationsIndexValidator.go({
          sentToDay: '4',
          sentToMonth: '1',
          sentToYear: null
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid to date')
      })
    })

    describe('because an to date is before the from date', () => {
      it('fails validation', () => {
        const result = NotificationsIndexValidator.go({
          sentFromDay: '1',
          sentFromMonth: '4',
          sentFromYear: '2024',
          sentToDay: '28',
          sentToMonth: '4',
          sentToYear: '2023'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('From date must be before to date')
      })
    })

    describe('because an invalid "sentBy" email address is given', () => {
      it('fails validation', () => {
        const result = NotificationsIndexValidator.go({
          sentBy: 'notanemail'
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid email')
      })
    })
  })
})
