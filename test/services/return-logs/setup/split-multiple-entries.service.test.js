'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SplitMultipleEntriesService = require('../../../../app/services/return-logs/setup/split-multiple-entries.service.js')

describe('Return Logs - Split Multiple Entries Service', () => {
  describe('when passed a valid multiple entries string', () => {
    let multipleEntries

    describe('thats been entered using new lines as the split', () => {
      before(() => {
        multipleEntries = '1.1,\r\n200,000,\r\n3,\r\n4,\r\nx,\r\nX,\r\n500,00\r\n6.6'
      })

      it('correctly splits the entries up into an array', () => {
        const result = SplitMultipleEntriesService.go(multipleEntries)

        expect(result).to.equal([1.1, 200000, 3, 4, null, null, 50000, 6.6])
      })
    })

    describe('thats been entered using commas as the split', () => {
      before(() => {
        multipleEntries = '1.1, 2.2, x, X, 3000, 400, 7.6,'
      })

      it('correctly splits the entries up into an array', () => {
        const result = SplitMultipleEntriesService.go(multipleEntries)

        expect(result).to.equal([1.1, 2.2, null, null, 3000, 400, 7.6])
      })
    })
  })
})
