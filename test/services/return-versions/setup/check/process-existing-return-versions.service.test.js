'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const ReturnVersionHelper = require('../../../../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../../../../app/models/return-version.model.js')

// Thing under test
const ProcessExistingReturnVersionsService = require('../../../../../app/services/return-versions/setup/check/process-existing-return-versions.service.js')

describe('Return Versions Setup - Process Existing Return Versions service', () => {
  let existingReturnVersionId
  let licenceId
  let newVersionStartDate

  describe('When a "current" return version has a "startDate" < "newVersionStartDate" and no "endDate"', () => {
    beforeEach(async () => {
      existingReturnVersionId = generateUUID()
      licenceId = generateUUID()
      newVersionStartDate = new Date('2024-06-01')

      await ReturnVersionHelper.add({
        id: existingReturnVersionId,
        licenceId,
        startDate: new Date('2024-04-01'),
        endDate: null
      })
    })

    it('sets the "endDate" of the existing record, a null "endDate" is returned for the new return version', async () => {
      const result = await ProcessExistingReturnVersionsService.go(licenceId, newVersionStartDate)
      const existingReturnVersion = await ReturnVersionModel.query().findById(existingReturnVersionId)

      expect(result).to.be.null()
      expect(existingReturnVersion.endDate).to.equal(new Date('2024-05-31'))
    })
  })

  describe('When a "current" return version has a "startDate" < "newVersionStartDate" and an "endDate" greater', () => {
    beforeEach(async () => {
      existingReturnVersionId = generateUUID()
      licenceId = generateUUID()
      newVersionStartDate = new Date('2024-06-01')

      await ReturnVersionHelper.add({
        id: existingReturnVersionId,
        licenceId,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-07-01')
      })
    })

    it('sets the "endDate" of the existing record and an "endDate" is returned for the new return version', async () => {
      const result = await ProcessExistingReturnVersionsService.go(licenceId, newVersionStartDate)
      const existingReturnVersion = await ReturnVersionModel.query().findById(existingReturnVersionId)

      expect(result).to.equal(new Date('2024-07-01'))
      expect(existingReturnVersion.endDate).to.equal(new Date('2024-05-31'))
    })
  })

  describe('When a "current" return version has a "startDate" > "newVersionStartDate" and no "endDate"', () => {
    beforeEach(async () => {
      existingReturnVersionId = generateUUID()
      licenceId = generateUUID()
      newVersionStartDate = new Date('2024-04-01')

      await ReturnVersionHelper.add({
        id: existingReturnVersionId,
        licenceId,
        startDate: new Date('2024-04-21')
      })
    })

    it('an "endDate" is returned for the new return version', async () => {
      const result = await ProcessExistingReturnVersionsService.go(licenceId, newVersionStartDate)
      const existingReturnVersion = await ReturnVersionModel.query().findById(existingReturnVersionId)

      expect(result).to.equal(new Date('2024-04-20'))
      expect(existingReturnVersion.endDate).to.equal(null)
    })
  })

  describe('When a "current" return version has a "startDate" === "newVersionStartDate" and no "endDate"', () => {
    beforeEach(async () => {
      existingReturnVersionId = generateUUID()
      licenceId = generateUUID()
      newVersionStartDate = new Date('2024-04-01')

      await ReturnVersionHelper.add({
        id: existingReturnVersionId,
        licenceId,
        startDate: new Date('2024-04-01'),
        endDate: null
      })
    })

    it('sets the "status" of the existing record, a null end date is returned for the new return version', async () => {
      const result = await ProcessExistingReturnVersionsService.go(licenceId, newVersionStartDate)
      const existingReturnVersion = await ReturnVersionModel.query().findById(existingReturnVersionId)

      expect(result).to.be.null()
      expect(existingReturnVersion.status).to.equal('superseded')
    })
  })

  describe('When a "current" return version has a "startDate" === "newVersionStartDate" and an "endDate"', () => {
    beforeEach(async () => {
      existingReturnVersionId = generateUUID()
      licenceId = generateUUID()
      newVersionStartDate = new Date('2024-04-01')

      await ReturnVersionHelper.add({
        id: existingReturnVersionId,
        licenceId,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-07-01')
      })
    })

    it('sets the "status" of the existing record and an "endDate" is returned for the new return version', async () => {
      const result = await ProcessExistingReturnVersionsService.go(licenceId, newVersionStartDate)
      const existingReturnVersion = await ReturnVersionModel.query().findById(existingReturnVersionId)

      expect(result).to.equal(new Date('2024-07-01'))
      expect(existingReturnVersion.status).to.equal('superseded')
    })
  })

  describe('When a return version is inserted in between two existing return versions', () => {
    beforeEach(async () => {
      existingReturnVersionId = generateUUID()
      licenceId = generateUUID()
      newVersionStartDate = new Date('2025-04-01')

      await ReturnVersionHelper.add({
        id: generateUUID(),
        licenceId,
        startDate: new Date('1993-04-27'),
        endDate: new Date('2008-03-31')
      })
      await ReturnVersionHelper.add({
        id: existingReturnVersionId,
        licenceId,
        startDate: new Date('2008-04-01'),
        endDate: new Date('2025-05-11')
      })
      await ReturnVersionHelper.add({
        id: generateUUID(),
        licenceId,
        startDate: new Date('2025-05-12')
      })
      await ReturnVersionHelper.add({
        id: generateUUID(),
        licenceId,
        status: 'superseded',
        startDate: new Date('2025-05-12')
      })
    })

    it('the correct "endDate" is returned for the existing return version and the previous ones endDate is updated', async () => {
      const result = await ProcessExistingReturnVersionsService.go(licenceId, newVersionStartDate)
      const existingReturnVersion = await ReturnVersionModel.query().findById(existingReturnVersionId)

      expect(result).to.equal(new Date('2025-05-11'))
      expect(existingReturnVersion.endDate).to.equal(new Date('2025-03-31'))
    })
  })
})
