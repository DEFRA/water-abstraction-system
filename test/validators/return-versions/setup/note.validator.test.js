'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const NoteValidator = require('../../../../app/validators/return-versions/setup/note.validator.js')

describe('Return Versions Setup - Note validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = NoteValidator.go({ note: 'Note added to return requirement' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "note" is given', () => {
      it('fails validation', () => {
        const result = NoteValidator.go({ note: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter details')
      })
    })

    describe('because too much "note" text is given', () => {
      it('fails validation', () => {
        const result = NoteValidator.go({
          note: `Lorem ipsum dolor sit amet consectetur adipiscing elitLorem ipsum dolor sit amet consectetur adipiscing elitLorem ipsum dolor sit amet consectetur adipiscing elitLorem ipsum dolor sit amet consectetur adipiscing elit

            Lorem ipsum dolor sit amet consectetur adipiscing elit

            Lorem ipsum dolor sit amet consectetur adipiscing elit

            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit

            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit`
        })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter no more than 500 characters')
      })
    })
  })
})
