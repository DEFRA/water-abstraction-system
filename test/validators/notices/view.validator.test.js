'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewValidator = require('../../../app/validators/notices/view.validator.js')

describe('Notices - View validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('that is fully populated', () => {
      beforeEach(() => {
        payload = {
          licence: '01/123',
          recipient: 'carol.shaw@atari.co.uk',
          status: 'sent'
        }
      })

      it('confirms the data is valid', () => {
        const result = ViewValidator.go(payload)

        expect(result.value).to.equal({
          licence: '01/123',
          recipient: 'carol.shaw@atari.co.uk',
          status: 'sent'
        })
        expect(result.error).not.to.exist()
      })
    })

    describe('that is partially populated', () => {
      beforeEach(() => {
        payload = {
          licence: '01/123'
        }
      })

      it('confirms the data is valid', () => {
        const result = ViewValidator.go(payload)

        expect(result.value).to.equal({
          licence: '01/123'
        })
        expect(result.error).not.to.exist()
      })
    })

    describe('that is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('confirms the data is valid', () => {
        const result = ViewValidator.go(payload)

        expect(result.value).to.equal({})
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = {}
    })

    describe('because "Licence" is too long', () => {
      beforeEach(() => {
        payload.licence = 'a'.repeat(26)
      })

      it('fails validation', () => {
        const result = ViewValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Licence number must be 25 characters or less')
        expect(result.error.details[0].path[0]).to.equal('licence')
      })
    })

    describe('because "Recipient" is too long', () => {
      beforeEach(() => {
        payload.recipient = 'a'.repeat(256)
      })

      it('fails validation', () => {
        const result = ViewValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Recipient must be 255 characters or less')
        expect(result.error.details[0].path[0]).to.equal('recipient')
      })
    })

    describe('because "Status" is unknown', () => {
      beforeEach(() => {
        payload.status = 'foo'
      })

      it('fails validation', () => {
        const result = ViewValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Select a valid status type')
        expect(result.error.details[0].path[0]).to.equal('status')
      })
    })
  })
})
