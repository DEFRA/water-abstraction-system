'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RemoveLicencesValidator = require('../../../../app/validators/notifications/setup/remove-licences.validator.js')

describe('Notifications Setup - Remove licences validator', () => {
  describe('when valid data is provided', () => {
    describe('and there is one licence provided', () => {
      it('confirms the data is valid', () => {
        const result = RemoveLicencesValidator.go({ removeLicences: '123/67' })

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('and there is more than one licence provided', () => {
      describe('and the licences are seperated by a ","', () => {
        it('confirms the data is valid', () => {
          const result = RemoveLicencesValidator.go({ removeLicences: '123/67, 456, 78*9' })

          expect(result.value).to.exist()
          expect(result.error).not.to.exist()
        })
      })

      describe('and the licences are separated by a "\\n"', () => {
        it('confirms the data is valid', () => {
          const result = RemoveLicencesValidator.go({ removeLicences: '123/67\n456  \n789' })

          expect(result.value).to.exist()
          expect(result.error).not.to.exist()
        })
      })

      describe('and the licences are seperated by a "," or "\\n"', () => {
        it('confirms the data is valid', () => {
          const result = RemoveLicencesValidator.go({ removeLicences: '123/67, 456 \n789' })

          expect(result.value).to.exist()
          expect(result.error).not.to.exist()
        })
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('because the licences are seperated by a " " (space)', () => {
      it('fails validation', () => {
        const result = RemoveLicencesValidator.go({ removeLicences: '123 456' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Separate the licence numbers with a comma or new line')
      })
    })

    describe('because the licences are seperated by a "," and "\\n" (e.g., ",\\n" or "\\n,")', () => {
      it('fails validation', () => {
        const result = RemoveLicencesValidator.go({ removeLicences: '123,\n456' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Separate the licence numbers with a comma or new line')
      })
    })
  })

  describe('when no data is provided', () => {
    describe('and no licences are given', () => {
      it('passes validation', () => {
        const result = RemoveLicencesValidator.go({ removeLicences: '' })

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })
})
