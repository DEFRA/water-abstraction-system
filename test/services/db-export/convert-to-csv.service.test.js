'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchBillingChargeCategoriesService = require('../../../app/services/db-export/fetch-billing-charge-categories.service')

// Thing under test
const ConvertToCSVService = require('../../../app/services/db-export/convert-to-csv.service')

let transformedData
let csvData

const csvHeader = [
  '"billingChargeCategoryId"',
  '"reference"',
  '"subsistenceCharge"',
  '"description"',
  '"shortDescription"',
  '"isTidal"',
  '"lossFactor"',
  '"modelTier"',
  '"isRestrictedSource"',
  '"minVolume"',
  '"maxVolume"',
  '"dateCreated"',
  '"dateUpdated"'
]

/**
 * billingChargeCategoriesTable has all data types we are testing for
 * objects{Date} - dateCreated
 * String - description
 * String (with added quotes)- shortDescription
 * Integer - maxVolume
 * Null - lossFactor
 * Undefined - modelTier
 */
const billingChargeCategoriesTable = [
  {
    billingChargeCategoryId: '20146cdc-9b40-4769-aa78-b51c17080d56',
    reference: '4.1.1',
    subsistenceCharge: 9700,
    description: 'Low loss tidal abstraction of water up to and "including" 25,002 megalitres a year where no model applies',
    shortDescription: 'Low loss, tidal, up to and including 25,002 ML/yr',
    dateCreated: new Date(2022, 11, 14, 18, 39, 45),
    dateUpdated: new Date(2022, 11, 14, 18, 39, 45),
    isTidal: true,
    lossFactor: null,
    modelTier: undefined,
    isRestrictedSource: false,
    minVolume: '',
    maxVolume: 25002
  }
]

const csvValues = [
  '"20146cdc-9b40-4769-aa78-b51c17080d56"',
  '"4.1.1"',
  '9700',
  '"Low loss tidal abstraction of water up to and ""including"" 25,002 megalitres a year where no model applies"',
  '"Low loss, tidal, up to and including 25,002 ML/yr"',
  '2022-12-14T18:39:45.000Z',
  '2022-12-14T18:39:45.000Z',
  'true',
  '',
  '',
  'false',
  '',
  '25002'
]

describe('Convert to CSV service', () => {
  describe('when given a table from the database', () => {
    beforeEach(async () => {
      Sinon.stub(FetchBillingChargeCategoriesService, 'go').resolves(billingChargeCategoriesTable)
    })

    afterEach(() => {
      Sinon.restore()
    })

    describe('that only has one row of data', () => {
      beforeEach(async () => {
        transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)
        csvData = _generateCSVData(csvValues)
      })

      describe('with values that are objects', () => {
        it('maintains the date as a timestamp format', async () => {
          expect(transformedData).to.equal(csvData)
        })

        it('converts the timestamp object into the iso8601 standard', async () => {
          expect(transformedData).to.include('2022-12-14T18:39:45.000Z')
        })
      })

      describe('with values that are integers', () => {
        it('maintains number values as an integer type', async () => {
          expect(transformedData).to.equal(csvData)
        })
      })

      describe('with values that are boolean', () => {
        it('maintains the true/false values as booleans', async () => {
          expect(transformedData).to.equal(csvData)
        })
      })

      describe('with values that are undefined or null', () => {
        it('it converts it to an empty string', async () => {
          expect(transformedData).to.equal(csvData)
        })
      })

      describe('with values that are strings', () => {
        describe('when the string does not have quotation marks', () => {
          it('adds quotation marks to the start and end', async () => {
            expect(transformedData).to.equal(csvData)
          })
        })

        describe('when the string alread has quotation marks', () => {
          it('escapes the quotation marks and adds them back in', async () => {
            expect(transformedData).to.equal(csvData)
          })
        })
      })

      it('has the table columns as headers', async () => {
        expect(transformedData).to.startWith(`${csvHeader}`)
      })

      it('converts the data to a CSV format', async () => {
        expect(transformedData).to.equal(csvData)
      })
    })

    describe('that has no rows of data', () => {
      let emptyBillingChargeCategoriesTable
      beforeEach(() => {
        emptyBillingChargeCategoriesTable = []
      })

      it('doesnt throw an error', () => {
        expect(ConvertToCSVService.go(emptyBillingChargeCategoriesTable)).to.not.reject()
      })

      it('exports the table to CSV without any rows', async () => {
        const transformedData = await ConvertToCSVService.go(emptyBillingChargeCategoriesTable)

        expect(transformedData).to.equal(csvHeader.toString())
      })
    })

    describe('that has multiple rows of data', () => {
      const multipleRowsbillingChargeCategoriesTable = billingChargeCategoriesTable

      beforeEach(() => {
        multipleRowsbillingChargeCategoriesTable.push(billingChargeCategoriesTable[0])
        csvData = csvHeader.join(',') + '\n' + csvValues.join(',') + '\n' + csvValues.join(',')
      })

      it('transforms all the rows to CSV', async () => {
        const transformedData = await ConvertToCSVService.go(multipleRowsbillingChargeCategoriesTable)

        expect(transformedData).to.equal(csvData)
      })
    })
  })
})

function _generateCSVData (data) {
  return csvHeader.join(',') + '\n' + data.join(',')
}
