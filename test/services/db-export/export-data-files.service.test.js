'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
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

describe('Export data files service', () => {
  let notifierStub

  beforeEach(() => {
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  let filePath

  describe('when successful', () => {
    beforeEach(() => {
      const fileName = 'Billing Charge Categories Table Export.csv'
      const __dirname = '/tmp/'
      filePath = path.join(__dirname, fileName)
    })

    afterEach(() => {
      // Delete the file
      fs.unlinkSync(filePath)
    })

    it('should write the CSV data to a file and return true', async () => {
      const data = csvHeader.join(',') + '\n' + csvValues.join(',')

      const returnedResult = await ExportDataFilesService.go(data)

      expect(fs.existsSync(filePath)).to.equal(true)
      expect(returnedResult).to.equal(true)
      expect(notifierStub.omg.calledWith('Billing Charge Categories Table exported successfully')).to.be.true()
    })
  })

  describe('when unsuccessful', () => {
    it('should handle errors and return false', async () => {
      const data = null
      const result = await ExportDataFilesService.go(data)

      expect(result).to.equal(false)
      expect(notifierStub.omfg.calledWith('Billing Charge Categories Table Export request errored')).to.be.true()
    })
  })
})
