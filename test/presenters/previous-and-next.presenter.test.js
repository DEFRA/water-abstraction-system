// Test helpers
import { generateUUID } from '../../app/lib/general.lib.js'

// Thing under test
import PreviousAndNextPresenter from '../../app/presenters/previous-and-next.presenter.js'

describe('Previous and next presenter', () => {
  let anchorElement
  let arrayOfElements
  let nextElement
  let previousElement

  beforeEach(() => {
    anchorElement = { id: generateUUID() }

    previousElement = {
      id: generateUUID()
    }

    nextElement = {
      id: generateUUID()
    }

    arrayOfElements = [
      { id: generateUUID() },
      { id: generateUUID() },
      previousElement,
      anchorElement,
      nextElement,
      { id: generateUUID() },
      { id: generateUUID() }
    ]
  })

  describe('when the anchor element is in the array', () => {
    describe('and there is a "previous" and "next" element', () => {
      it('returns the populated "previous" and "next" elements', () => {
        const result = PreviousAndNextPresenter(arrayOfElements, anchorElement)

        expect(result).toEqual({
          previous: previousElement,
          next: nextElement
        })
      })
    })

    describe('and there is only a "previous" element', () => {
      beforeEach(() => {
        arrayOfElements = [previousElement, anchorElement]
      })

      it('returns the populated "previous" element', () => {
        const result = PreviousAndNextPresenter(arrayOfElements, anchorElement)

        expect(result).toEqual({
          previous: previousElement,
          next: null
        })
      })
    })

    describe('and there is only a "next" element', () => {
      beforeEach(() => {
        arrayOfElements = [anchorElement, nextElement]
      })

      it('returns the populated "next" element', () => {
        const result = PreviousAndNextPresenter(arrayOfElements, anchorElement)

        expect(result).toEqual({
          previous: null,
          next: nextElement
        })
      })
    })

    describe('and there is only the anchor element', () => {
      beforeEach(() => {
        arrayOfElements = [anchorElement]
      })

      it('returns the "previous" and "next" elements as null', () => {
        const result = PreviousAndNextPresenter(arrayOfElements, anchorElement)

        expect(result).toEqual({
          previous: null,
          next: null
        })
      })
    })
  })

  describe('when the anchor element is not in the array', () => {
    beforeEach(() => {
      arrayOfElements = [
        {
          id: generateUUID()
        },
        {
          id: generateUUID()
        }
      ]
    })

    it('returns the "previous" and "next" as null', () => {
      const result = PreviousAndNextPresenter(arrayOfElements, anchorElement)

      expect(result).toEqual({
        previous: null,
        next: null
      })
    })
  })
})
