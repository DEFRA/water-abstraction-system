'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { today } = require('../../../app/lib/general.lib.js')

// Thing under test
const IndexValidator = require('../../../app/validators/notices/index.validator.js')

describe('Notices - Index validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('that is fully populated', () => {
      beforeEach(() => {
        payload = _payload()
        payload.noticeTypes = ['reduce', 'stop']
        payload.statuses = ['error', 'sent']
      })

      it('confirms the data is valid', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.equal({
          noticeTypes: ['reduce', 'stop'],
          sentBy: 'test@test.com',
          sentFromDay: '1',
          sentFromMonth: '4',
          sentFromYear: '2024',
          sentToDay: '28',
          sentToMonth: '4',
          sentToYear: '2024',
          fromDate: new Date('2024-04-01'),
          statuses: ['error', 'sent'],
          toDate: new Date('2024-04-28')
        })
        expect(result.error).not.to.exist()
      })
    })

    describe('that is partially populated', () => {
      beforeEach(() => {
        payload = _payload()

        delete payload.sentBy
        delete payload.sentToDay
        delete payload.sentToMonth
        delete payload.sentToYear
        delete payload.sentToYear
      })

      it('confirms the data is valid', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.equal({
          fromDate: new Date('2024-04-01'),
          noticeTypes: [],
          sentFromDay: '1',
          sentFromMonth: '4',
          sentFromYear: '2024',
          statuses: [],
          toDate: undefined
        })
        expect(result.error).not.to.exist()
      })
    })

    describe('that is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('confirms the data is valid', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.equal({ fromDate: undefined, toDate: undefined })
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = _payload()
    })

    describe('because "Reference" is too long', () => {
      beforeEach(() => {
        payload.reference = 'a'.repeat(12)
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Reference must be 11 characters or less')
        expect(result.error.details[0].path[0]).to.equal('reference')
      })
    })

    describe('because "Sent by" is too long', () => {
      beforeEach(() => {
        payload.sentBy = 'a'.repeat(256)
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Sent by must be 255 characters or less')
        expect(result.error.details[0].path[0]).to.equal('sentBy')
      })
    })

    describe('because part of "Sent from" is invalid', () => {
      describe('because it has not been provided', () => {
        beforeEach(() => {
          delete payload.sentFromDay
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a valid from date')
          expect(result.error.details[0].path[0]).to.equal('fromDate')
        })
      })

      describe('because it is not a number', () => {
        beforeEach(() => {
          payload.sentFromYear = 'xx'
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a valid from date')
          expect(result.error.details[0].path[0]).to.equal('fromDate')
        })
      })

      describe('because it would result in an invalid date', () => {
        beforeEach(() => {
          payload.sentFromMonth = '13'
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a valid from date')
          expect(result.error.details[0].path[0]).to.equal('fromDate')
        })
      })
    })

    describe('because "Sent from" is in the future', () => {
      beforeEach(() => {
        const todaysDate = today()

        payload.sentFromYear = (todaysDate.getFullYear() + 1).toString()
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal("From date must be either today's date or in the past")
        expect(result.error.details[0].path[0]).to.equal('fromDate')
      })
    })

    describe('because part of "Sent to" is invalid', () => {
      describe('because it has not been provided', () => {
        beforeEach(() => {
          delete payload.sentToDay
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a valid to date')
          expect(result.error.details[0].path[0]).to.equal('toDate')
        })
      })

      describe('because it is not a number', () => {
        beforeEach(() => {
          payload.sentToYear = 'xx'
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a valid to date')
          expect(result.error.details[0].path[0]).to.equal('toDate')
        })
      })

      describe('because it would result in an invalid date', () => {
        beforeEach(() => {
          payload.sentToMonth = '13'
        })

        it('fails validation', () => {
          const result = IndexValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a valid to date')
          expect(result.error.details[0].path[0]).to.equal('toDate')
        })
      })
    })

    describe('because "Sent to" is in the future', () => {
      beforeEach(() => {
        const today = new Date()

        payload.sentToYear = (today.getFullYear() + 1).toString()
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal("To date must be either today's date or in the past")
        expect(result.error.details[0].path[0]).to.equal('toDate')
      })
    })

    describe('because "Sent from" is after "Sent to"', () => {
      beforeEach(() => {
        payload.sentFromMonth = '5'
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('The from date must be before the to date')
        expect(result.error.details[0].path[0]).to.equal('fromDate')
      })
    })

    describe('because "Notice types" contains an unknown option', () => {
      beforeEach(() => {
        payload.noticeTypes.push('foo-bar')
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Select a valid notice type')
        expect(result.error.details[0].path[0]).to.equal('noticeTypes')
      })
    })

    describe('because "Statuses" contains an unknown option', () => {
      beforeEach(() => {
        payload.statuses.push('foo-bar')
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Select a valid status')
        expect(result.error.details[0].path[0]).to.equal('statuses')
      })
    })
  })
})

function _payload() {
  return {
    noticeTypes: [],
    sentBy: 'test@test.com',
    sentFromDay: '1',
    sentFromMonth: '4',
    sentFromYear: '2024',
    sentToDay: '28',
    sentToMonth: '4',
    sentToYear: '2024',
    statuses: []
  }
}
