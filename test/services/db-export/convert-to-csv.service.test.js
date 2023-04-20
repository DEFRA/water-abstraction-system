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

let csvData
let billingChargeCategoriesTable
let csvValues

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

describe('Convert to CSV service', () => {
  beforeEach(async () => {
    billingChargeCategoriesTable = [
      {
        billingChargeCategoryId: '20146cdc-9b40-4769-aa78-b51c17080d56',
        reference: '4.1.1',
        subsistenceCharge: 9700,
        description: 'Low loss tidal abstraction of water up to and including 25,002 megalitres a year where no model applies',
        shortDescription: 'Low loss, tidal, up to and including 25,002 ML/yr',
        dateCreated: '2022-12-14T18:39:45.000Z',
        dateUpdated: '2022-12-14T18:39:45.000Z',
        isTidal: true,
        lossFactor: 'low',
        modelTier: 'no model',
        isRestrictedSource: false,
        minVolume: 0,
        maxVolume: 25002
      }
    ]

    csvValues = [
      '"20146cdc-9b40-4769-aa78-b51c17080d56"',
      '"4.1.1"',
      '"9700"',
      '"Low loss tidal abstraction of water up to and including 25,002 megalitres a year where no model applies"',
      '"Low loss, tidal, up to and including 25,002 ML/yr"',
      '"2022-12-14T18:39:45.000Z"',
      '"2022-12-14T18:39:45.000Z"',
      '"true"',
      '"low"',
      '"no model"',
      '"false"',
      '"0"',
      '"25002"'
    ]
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a table from the database', () => {
    beforeEach(async () => {
      Sinon.stub(FetchBillingChargeCategoriesService, 'go').resolves(billingChargeCategoriesTable)
      csvData = _generateCSVData(csvValues)
    })

    describe('that only has one row', () => {
      it('converts the data to a CSV format', async () => {
        const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

        expect(transformedData).to.equal(csvData)
      })

      it('has the table columns as headers', async () => {
        const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

        expect(transformedData).to.startWith(`${csvHeader}`)
      })
    })

    describe('with values from the table that are undefined or null', () => {
      beforeEach(() => {
        billingChargeCategoriesTable[0].reference = null
        billingChargeCategoriesTable[0].subsistenceCharge = undefined
        billingChargeCategoriesTable[0].description = ''
        csvValues[1] = ''
        csvValues[2] = ''
        csvValues[3] = ''
        csvData = _generateCSVData(csvValues)
      })

      it('it converts it to an empty string', async () => {
        const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

        expect(transformedData).to.equal(csvData)
      })
    })

    describe('with values from the table that are objects', () => {
      beforeEach(() => {
        billingChargeCategoriesTable[0].dateCreated = new Date(2022, 11, 14, 18, 39, 45)
        billingChargeCategoriesTable[0].dateUpdated = new Date(2022, 11, 14, 18, 39, 45)
        csvData = _generateCSVData(csvValues)
      })

      it('converts it into a string', async () => {
        const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

        expect(transformedData).to.equal(csvData)
      })

      it('converts the timestamp object into the iso8601 standard', async () => {
        const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

        expect(transformedData).to.include('2022-12-14T18:39:45.000Z')
      })
    })

    describe('with values that are strings', () => {
      describe('when the string doesnt have quotation marks', () => {
        beforeEach(() => {
          billingChargeCategoriesTable[0].reference = '4.1.1'
          csvData = _generateCSVData(csvValues)
        })

        it('adds quotation marks to the start and end', async () => {
          const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

          expect(transformedData).to.equal(csvData)
        })
      })

      describe('when the string already has quotation marks', () => {
        beforeEach(() => {
          billingChargeCategoriesTable[0].shortDescription = 'Low loss, tidal, up to and "including" 25,002 ML/yr'
          csvValues[4] = '"Low loss, tidal, up to and ""including"" 25,002 ML/yr"'
          csvData = _generateCSVData(csvValues)
        })

        it('escapes the quotation marks and adds them back in', async () => {
          const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

          expect(transformedData).to.equal(csvData)
        })
      })
    })

    describe('with values that are numbers', () => {
      beforeEach(() => {
        billingChargeCategoriesTable[0].maxVolume = 123456
        csvValues[12] = '"123456"'
        csvData = _generateCSVData(csvValues)
      })

      it('converts the number to a string', async () => {
        const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

        expect(transformedData).to.equal(csvData)
      })
    })

    describe('with values that are boolean', () => {
      beforeEach(() => {
        billingChargeCategoriesTable[0].isTidal = true
        csvValues[7] = '"true"'
        csvData = _generateCSVData(csvValues)
      })

      it('converts the boolean to a string', async () => {
        const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

        expect(transformedData).to.equal(csvData)
      })
    })

    describe('that doesnt have any rows', () => {
      beforeEach(() => {
        billingChargeCategoriesTable = []
      })

      it('doesnt throw an error', () => {
        expect(ConvertToCSVService.go(billingChargeCategoriesTable)).to.not.reject()
      })

      it('exports the table to CSV without any rows', async () => {
        const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

        expect(transformedData).to.equal(csvHeader.toString())
      })
    })

    describe('that has multiple rows', () => {
      beforeEach(() => {
        billingChargeCategoriesTable.push(billingChargeCategoriesTable[0])
        csvData = csvHeader.join(',') + '\n' + csvValues.join(',') + '\n' + csvValues.join(',')
      })

      it('transforms all the rows to CSV', async () => {
        const transformedData = await ConvertToCSVService.go(billingChargeCategoriesTable)

        expect(transformedData).to.equal(csvData)
      })
    })
  })
})

function _generateCSVData (data) {
  return csvHeader.join(',') + '\n' + data.join(',')
}
