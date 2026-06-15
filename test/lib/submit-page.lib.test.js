'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

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
      before(() => {
        payload = { clearFilters: 'reset' }
      })

      it('clears the specified filter object from the session and returns TRUE', () => {
        const result = SubmitPageLib.clearFilters(payload, yarStub, filterKey)

        expect(yarStub.clear.calledWith(filterKey)).to.be.true()
        expect(result).to.be.true()
      })
    })

    describe('when there is no instruction to clear filters', () => {
      before(() => {
        payload = {}
      })

      it('leaves the specified filter object untouched and returns FALSE', () => {
        const result = SubmitPageLib.clearFilters(payload, yarStub, filterKey)

        expect(yarStub.clear.called).to.be.false()
        expect(result).to.be.false()
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
      before(() => {
        yarStub = YarStub.build(Sinon)
        yarStub.get.returns(null)
      })

      it('returns the expected results, "openFilter" is set to FALSE', () => {
        const result = SubmitPageLib.processSavedFilters(yarStub, filterKey)

        expect(result).to.equal({ openFilter: false })
      })
    })

    describe('when filters have been saved with empty values', () => {
      before(() => {
        yarStub = YarStub.build(Sinon)
        yarStub.get.returns({ regions: [], status: null })
      })

      it('returns the expected results, "openFilter" is set to FALSE', () => {
        const result = SubmitPageLib.processSavedFilters(yarStub, filterKey)

        expect(result).to.equal({ regions: [], status: null, openFilter: false })
      })
    })

    describe('when a filter with array values been saved', () => {
      before(() => {
        yarStub = YarStub.build(Sinon)
        yarStub.get.returns({ regions: ['south', 'north'] })
      })

      it('returns the expected results, "openFilter" is set to TRUE', () => {
        const result = SubmitPageLib.processSavedFilters(yarStub, filterKey)

        expect(result).to.equal({ regions: ['south', 'north'], openFilter: true })
      })
    })

    describe('when a filter with non array values been saved', () => {
      before(() => {
        yarStub = YarStub.build(Sinon)
        yarStub.get.returns({ status: 'review' })
      })

      it('returns the expected results, "openFilter" is set to TRUE', () => {
        const result = SubmitPageLib.processSavedFilters(yarStub, filterKey)

        expect(result).to.equal({ status: 'review', openFilter: true })
      })
    })
  })
})
