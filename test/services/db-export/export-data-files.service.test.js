'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ExportDataFilesService = require('../../../app/services/db-export/export-data-files.service')

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

const csvValues = [
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

describe('Export data files service', () => {
  it('should write the CSV data to a file', async () => {
    const data = csvHeader.join(',') + '\n' + csvValues.join(',')
    const result = await ExportDataFilesService.go(data)

    expect(result).to.equal(true)
  })

  it('should handle errors when the file cannot be written', async () => {
    const data = null

    // introduce a bug by setting the file path to an invalid location
    ExportDataFilesService.filePath = './invalid/path/Billing Charge Categories Table Export.csv'
    const result = await ExportDataFilesService.go(data)

    expect(result).to.equal(false)
  })
})
