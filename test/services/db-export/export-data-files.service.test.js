'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const fs = require('fs')
const path = require('path')

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
let filePath
beforeEach(() => {
  const fileName = 'Billing Charge Categories Table Export.csv'
  const __dirname = '/home/repos/water-abstraction-system/app/services/db-export/'
  filePath = path.join(__dirname, fileName)
})

describe('Export data files service', () => {
  it('should write the CSV data to a file and return true', async () => {
    const data = csvHeader.join(',') + '\n' + csvValues.join(',')

    const returnedResult = await ExportDataFilesService.go(data)

    expect(fs.existsSync(filePath)).to.equal(true)
    expect(returnedResult).to.equal(true)

    // Delete the file
    fs.unlinkSync(filePath)
  })

  it('should handle errors when the file cannot be written', async () => {
    const data = null

    // introduce a bug by setting the file path to an invalid location
    ExportDataFilesService.filePath = './invalid/path/Billing Charge Categories Table Export.csv'
    const result = await ExportDataFilesService.go(data)

    expect(result).to.equal(false)
  })
})
