'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const YarStub = require('../support/stubs/yar.stub.js')

// Thing under test
const SubmitPageLib = require('../../app/lib/submit-page.lib.js')

describe('SubmitPageLib', () => {
  let payload

  describe('#clearFilters()', () => {
    const filterKey = 'filterToClear'

    let yarStub

    beforeEach(() => {
      yarStub = YarStub.build(Sinon)
    })

    afterEach(() => {
      Sinon.restore()
    })

    describe('when called with the instruction to clear filters', () => {
      beforeAll(() => {
        payload = { clearFilters: 'reset' }
      })

      it('clears the specified filter object from the session and returns TRUE', () => {
        const result = SubmitPageLib.clearFilters(payload, yarStub, filterKey)

        expect(yarStub.clear.calledWith(filterKey)).toBe(true)
        expect(result).toBe(true)
      })
    })

    describe('when there is no instruction to clear filters', () => {
      beforeAll(() => {
        payload = {}
      })

      it('leaves the specified filter object untouched and returns FALSE', () => {
        const result = SubmitPageLib.clearFilters(payload, yarStub, filterKey)

        expect(yarStub.clear.called).toBe(false)
        expect(result).toBe(false)
      })
    })
  })

  describe('#handleOneOptionSelected()', () => {
    const key = 'propertyToCheck'

    let payload

    describe('when the payload is empty', () => {
      beforeAll(() => {
        payload = {}
      })

      it('adds the key to the payload as an empty array', () => {
        SubmitPageLib.handleOneOptionSelected(payload, key)

        expect(payload).toEqual({ propertyToCheck: [] })
      })
    })

    describe('when the payload contains a string', () => {
      beforeAll(() => {
        payload = { propertyToCheck: 'checkBoxValue' }
      })

      it('returns the key in the payload with the string converted to an array', () => {
        SubmitPageLib.handleOneOptionSelected(payload, key)

        expect(payload).toEqual({ propertyToCheck: ['checkBoxValue'] })
      })
    })

    describe('when the payload contains an array', () => {
      beforeAll(() => {
        payload = { propertyToCheck: ['checkBoxValue', 'anotherCheckBoxValue'] }
      })

      it('does not alter the payload', () => {
        SubmitPageLib.handleOneOptionSelected(payload, key)

        expect(payload).toEqual({ propertyToCheck: ['checkBoxValue', 'anotherCheckBoxValue'] })
      })
    })
  })

  describe('#processSavedFilters()', () => {
    const filterKey = 'filterToProcess'

    let yarStub

    afterEach(() => {
      Sinon.restore()
    })

    describe('when no filters have been saved', () => {
      beforeAll(() => {
        yarStub = YarStub.build(Sinon)
        yarStub.get.returns(null)
      })

      it('returns the expected results, "openFilter" is set to FALSE', () => {
        const result = SubmitPageLib.processSavedFilters(yarStub, filterKey)

        expect(result).toEqual({ openFilter: false })
      })
    })

    describe('when filters have been saved with empty values', () => {
      beforeAll(() => {
        yarStub = YarStub.build(Sinon)
        yarStub.get.returns({ regions: [], status: null })
      })

      it('returns the expected results, "openFilter" is set to FALSE', () => {
        const result = SubmitPageLib.processSavedFilters(yarStub, filterKey)

        expect(result).toEqual({ regions: [], status: null, openFilter: false })
      })
    })

    describe('when a filter with array values been saved', () => {
      beforeAll(() => {
        yarStub = YarStub.build(Sinon)
        yarStub.get.returns({ regions: ['south', 'north'] })
      })

      it('returns the expected results, "openFilter" is set to TRUE', () => {
        const result = SubmitPageLib.processSavedFilters(yarStub, filterKey)

        expect(result).toEqual({ regions: ['south', 'north'], openFilter: true })
      })
    })

    describe('when a filter with non array values been saved', () => {
      beforeAll(() => {
        yarStub = YarStub.build(Sinon)
        yarStub.get.returns({ status: 'review' })
      })

      it('returns the expected results, "openFilter" is set to TRUE', () => {
        const result = SubmitPageLib.processSavedFilters(yarStub, filterKey)

        expect(result).toEqual({ status: 'review', openFilter: true })
      })
    })
  })
})
