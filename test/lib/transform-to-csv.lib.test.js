'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const { transformArrayToCSVRow } = require('../../app/lib/transform-to-csv.lib.js')

describe('Transform to csv', () => {
  describe('#transformArrayToCSVRow', () => {
    let testArray

    beforeEach(() => {
      testArray = _testArray()
    })

    it('correctly transforms all data types to csv', () => {
      const result = transformArrayToCSVRow(testArray)

      expect(result).to.equal(
        '"20146cdc-9b40-4769-aa78-b51c17080d56",' +
          '"4.1.1",' +
          '9700,' +
          '"Low loss tidal abstraction of water up to and ""including"" 25,002 megalitres, known as ML/yr a year where no model applies",' +
          '2022-12-14T18:39:45.000Z,' +
          'true,' +
          ',' +
          ',' +
          'false,' +
          ',' +
          '25002,' +
          '"{""message"": ""a json object""}"' +
          '\n'
      )
    })

    describe('when the data type is', () => {
      describe('an object', () => {
        it('correctly formats the object to a string', () => {
          const result = transformArrayToCSVRow([{ message: 'a json object' }])

          expect(result).to.equal('"{""message"": ""a json object""}"\n')
        })
      })

      describe('a UUID', () => {
        it('correctly formats the UUID to a string', () => {
          const result = transformArrayToCSVRow(['20146cdc-9b40-4769-aa78-b51c17080d56'])

          expect(result).to.equal('"20146cdc-9b40-4769-aa78-b51c17080d56"\n')
        })
      })

      describe('a boolean', () => {
        it('correctly formats the boolean to a string', () => {
          const result = transformArrayToCSVRow([true])

          expect(result).to.equal('true\n')
        })
      })

      describe('a number', () => {
        it('correctly formats the number to a string', () => {
          const result = transformArrayToCSVRow([100])

          expect(result).to.equal('100\n')
        })
      })

      describe('a string containing', () => {
        describe('a comma ,', () => {
          it('correctly formats the string', () => {
            const result = transformArrayToCSVRow(['I am a, comma seperated sentence.'])

            expect(result).to.equal('"I am a, comma seperated sentence."\n')
          })
        })

        describe('a single double quote "', () => {
          it('correctly formats the string', () => {
            const result = transformArrayToCSVRow(['I am a " double quote sentence.'])

            expect(result).to.equal('"I am a "" double quote sentence."\n')
          })
        })

        describe('a double double quote ""', () => {
          it('correctly formats the string', () => {
            const result = transformArrayToCSVRow(['I am a "" double quote sentence.'])

            expect(result).to.equal('"I am a """" double quote sentence."\n')
          })
        })

        describe('a back slash "\\" ', () => {
          it('correctly formats the string', () => {
            const result = transformArrayToCSVRow(['I am a  "\\"  back slash sentence.'])

            expect(result).to.equal('"I am a  ""\\""  back slash sentence."\n')
          })
        })
      })

      describe('a date', () => {
        describe('and it has a timestamp - "T12:20:12.012Z"', () => {
          it('correctly formats the date to an ISO string', () => {
            const result = transformArrayToCSVRow([new Date('2021-02-01T12:20:12.012Z')])

            expect(result).to.equal('2021-02-01T12:20:12.012Z\n')
          })
        })

        describe('and it does not have a timestamp - "T00:00:00.000Z"', () => {
          it('correctly formats the date to a formatted ISO string', () => {
            const result = transformArrayToCSVRow([new Date('2021-02-01')])

            expect(result).to.equal('2021-02-01\n')
          })
        })
      })
    })

    describe('when an array of strings us provided', () => {
      it('converts the data to a CSV format', () => {
        const result = transformArrayToCSVRow(['name', 'age'])

        expect(result).to.equal('"name","age"\n')
      })
    })

    describe('when no array is provided', () => {
      it('returns undefined', () => {
        const result = transformArrayToCSVRow()

        expect(result).to.equal(undefined)
      })
    })
  })
})

function _testArray() {
  return [
    '20146cdc-9b40-4769-aa78-b51c17080d56',
    '4.1.1',
    9700,
    'Low loss tidal abstraction of water up to and "including" 25,002 megalitres, known as ML/yr a year where no model applies',
    new Date(2022, 11, 14, 18, 39, 45),
    true,
    null,
    undefined,
    false,
    '',
    25002,
    { message: 'a json object' }
  ]
}
