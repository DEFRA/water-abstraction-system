'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AddNoteValidator = require('../../../app/validators/return-requirements/add-note.validator.js')

describe('AddNote validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = AddNoteValidator.go({ note: 'Note added to return requirment' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when valid data is provided', () => {
    describe("because no 'note' is given", () => {
      it('fails validation', () => {
        const result = AddNoteValidator.go({ note: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Text must be entered')
      })
    })

    describe("because too much 'note' text is given", () => {
      it('fails validation', () => {
        const result = AddNoteValidator.go({
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
        expect(result.error.details[0].message).to.equal('Textarea should have a value with character count less than 500')
      })
    })
  })
})
