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
        multipleEntries = '1.1,\r\n200,000,\r\n3,\r\n4,\r\n200.4,\r\n300,\r\n500,00\r\n6.6'
      })

      it('correctly splits the entries up into an array', () => {
        const result = SplitMultipleEntriesService.go(multipleEntries)

        expect(result).to.equal([1.1, 200000, 3, 4, 200.4, 300, 50000, 6.6])
      })

      describe('that has been entered with "x"s values', () => {
        before(() => {
          multipleEntries = 'x,\r\nX, \r\nx, \r\nX\r\n'
        })

        it('correctly converts the "x" values into null', () => {
          const result = SplitMultipleEntriesService.go(multipleEntries)

          expect(result).to.equal([null, null, null, null])
        })
      })
    })

    describe('thats been entered using commas as the split', () => {
      before(() => {
        // NOTE: By adding a comma and space at the end of the string when this is split it will create a empty value
        // in the array. This should then be stripped out of the final array as only numbers or null values are allowed
        multipleEntries = '1.1, 2.2, 200, 400.4, 3000, 400, 7.6, '
      })

      it('correctly splits the entries up into an array', () => {
        const result = SplitMultipleEntriesService.go(multipleEntries)

        expect(result).to.equal([1.1, 2.2, 200, 400.4, 3000, 400, 7.6])
      })

      describe('that has been entered with "x"s values', () => {
        before(() => {
          multipleEntries = 'x, X, x, X'
        })

        it('correctly converts the "x" values into null', () => {
          const result = SplitMultipleEntriesService.go(multipleEntries)

          expect(result).to.equal([null, null, null, null])
        })
      })
    })
  })
})
