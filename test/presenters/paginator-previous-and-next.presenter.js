'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../app/lib/general.lib.js')

// Thing under test
const PaginatorPreviousAndNextPresenter = require('../../app/presenters/paginator-previous-and-next.presenter.js')

describe.only('Paginator previous and next presenter', () => {
  let arrayOfElements
  let elementAnchorId
  let nextElement
  let previousElement

  beforeEach(() => {
    elementAnchorId = generateUUID()

    previousElement = {
      id: generateUUID()
    }

    nextElement = {
      id: generateUUID()
    }

    arrayOfElements = [previousElement, { id: elementAnchorId }, nextElement]
  })

  describe('when the anchor element is in the array', () => {
    describe('and there is a "previous" and "next" ', () => {
      it('returns the "previous" and "next" elements', () => {
        const result = PaginatorPreviousAndNextPresenter.go(arrayOfElements, elementAnchorId)

        expect(result).to.equal({
          previous: previousElement,
          next: nextElement
        })
      })
    })

    describe('and there is only a "previous" element', () => {
      beforeEach(() => {
        arrayOfElements = [previousElement, { id: elementAnchorId }]
      })

      it('returns the "next" elements', () => {
        const result = PaginatorPreviousAndNextPresenter.go(arrayOfElements, elementAnchorId)

        expect(result).to.equal({
          previous: previousElement,
          next: null
        })
      })
    })

    describe('and there is only a "next" element', () => {
      beforeEach(() => {
        arrayOfElements = [{ id: elementAnchorId }, nextElement]
      })

      it('returns the "next" elements', () => {
        const result = PaginatorPreviousAndNextPresenter.go(arrayOfElements, elementAnchorId)

        expect(result).to.equal({
          previous: null,
          next: nextElement
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
      const result = PaginatorPreviousAndNextPresenter.go(arrayOfElements, elementAnchorId)

      expect(result).to.equal({
        previous: null,
        next: null
      })
    })
  })
})
