// Test framework
import { describe, expect, it } from 'vitest'

// Thing under test
import NoteValidator from '../../../../app/validators/return-versions/setup/note.validator.js'

describe('Return Versions Setup - Note validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = NoteValidator({ note: 'Note added to return requirement' })

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "note" is given', () => {
      it('fails validation', () => {
        const result = NoteValidator({ note: '' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter details')
      })
    })

    describe('because too much "note" text is given', () => {
      it('fails validation', () => {
        const result = NoteValidator({
          note: `Lorem ipsum dolor sit amet consectetur adipiscing elitLorem ipsum dolor sit amet consectetur adipiscing elitLorem ipsum dolor sit amet consectetur adipiscing elitLorem ipsum dolor sit amet consectetur adipiscing elit

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
