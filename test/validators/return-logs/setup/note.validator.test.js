'use strict'

// Thing under test
const NoteValidator = require('../../../../app/validators/return-logs/setup/note.validator.js')

describe('Return Logs Setup - Note validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = NoteValidator.go({ note: 'Note added to return requirement' })

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "note" is given', () => {
      it('fails validation', () => {
        const result = NoteValidator.go({ note: '' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter details')
      })
    })

    describe('because too much "note" text is given', () => {
      it('fails validation', () => {
        const result = NoteValidator.go({
          note: `Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit`
        })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter no more than 500 characters')
      })
    })
  })
})
