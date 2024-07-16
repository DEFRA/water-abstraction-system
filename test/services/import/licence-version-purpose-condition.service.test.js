'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

const { randomInteger } = require('../../support/general.js')

// Test helpers
const LicenceVersionPurposeConditionModel = require('../../../app/models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')

// Thing under test
const LicenceVersionPurposeConditionService = require('../../../app/services/import/licence-version-purpose-condition.service.js')

describe('Licence Version Purpose Condition Service', () => {
  const testLicenceVersionPurposeConditionTypeId = '4eac5d7e-21e4-475c-8108-3e0c2ece181f'
  const externalId = `9:${randomInteger(100, 99999)}`
  let testLicenceVersionPurpose

  before(async () => {
    testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add()
  })

  it('can successfully insert a new record', async () => {
    await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId,
      notes: 'This is a note',
      source: 'nald'
    })

    const result = await LicenceVersionPurposeConditionModel.query().where({
      externalId
    })

    expect(result[0].licenceVersionPurposeId).to.equal(testLicenceVersionPurpose.id)
    expect(result[0].licenceVersionPurposeConditionTypeId).to.equal(testLicenceVersionPurposeConditionTypeId)
    expect(result[0].externalId).to.equal(externalId)
    expect(result[0].notes).to.equal('This is a note')
    expect(result[0].source).to.equal('nald')
  })

  it('can successfully update an existing record', async () => {
    await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId,
      notes: 'This is a different note',
      source: 'nald'
    })

    const result = await LicenceVersionPurposeConditionModel.query().where({
      externalId
    })

    expect(result[0].licenceVersionPurposeId).to.equal(testLicenceVersionPurpose.id)
    expect(result[0].licenceVersionPurposeConditionTypeId).to.equal(testLicenceVersionPurposeConditionTypeId)
    expect(result[0].externalId).to.equal(externalId)
    expect(result[0].notes).to.equal('This is a different note')
    expect(result[0].source).to.equal('nald')
  })

  it('will return an error if it is sent an object with an invalid licenceVersionPurposeId', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: null,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId: `9:${randomInteger(100, 99999)}`,
      source: 'nald'
    })

    expect(result).to.equal('"licenceVersionPurposeId" must be a string')
  })

  it('will return an error if it is sent an object without a licenceVersionPurposeId', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: null,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId: `9:${randomInteger(100, 99999)}`,
      source: 'nald'
    })

    expect(result).to.equal('"licenceVersionPurposeId" must be a string')
  })

  it('will return an error if it is sent an object with an invalid licenceVersionPurposeId', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: 'string',
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId: `9:${randomInteger(100, 99999)}`,
      source: 'nald'
    })

    expect(result).to.equal('"licenceVersionPurposeId" must be a valid GUID')
  })

  it('will return an error if it is sent an object without a licenceVersionPurposeConditionTypeId', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: null,
      externalId: `9:${randomInteger(100, 99999)}`,
      source: 'nald'
    })

    expect(result).to.equal('"licenceVersionPurposeConditionTypeId" must be a string')
  })

  it('will return an error if it is sent an object with an invalid licenceVersionPurposeConditionTypeId', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: 'string',
      externalId: `9:${randomInteger(100, 99999)}`,
      source: 'nald'
    })

    expect(result).to.equal('"licenceVersionPurposeConditionTypeId" must be a valid GUID')
  })

  it('will return an error if it is sent an object without a externalId', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId: null,
      source: 'nald'
    })

    expect(result).to.equal('"externalId" must be a string')
  })

  it('will return an error if it is sent an object with an invalid externalId', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId: 1,
      source: 'nald'
    })

    expect(result).to.equal('"externalId" must be a string')
  })

  it('will not return an error if it is sent an object without a note', async () => {
    const externalId = `9:${randomInteger(100, 99999)}`
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId,
      source: 'nald'
    })

    expect(result.externalId).to.equal(externalId)
  })

  it('will return an error if it is sent an object with a null notes', async () => {
    const externalId = `9:${randomInteger(100, 99999)}`
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      notes: null,
      externalId,
      source: 'nald'
    })

    expect(result).to.equal('"notes" must be a string')
  })

  it('will return an error if it is sent an object with an invalid notes', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId: `9:${randomInteger(100, 99999)}`,
      notes: 1,
      source: 'nald'
    })

    expect(result).to.equal('"notes" must be a string')
  })

  it('will return an error if it is sent an object without a source', async () => {
    const externalId = `9:${randomInteger(100, 99999)}`
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId
    })

    expect(result).to.equal('"source" is required')
  })

  it('will return an error if it is sent an object with an invalid source', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId: `9:${randomInteger(100, 99999)}`,
      source: null
    })

    expect(result).to.equal('"source" must be a string')
  })

  it('will not return an error if it is sent an object with a valid param1', async () => {
    const externalId = `9:${randomInteger(100, 99999)}`
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId,
      param1: 'DEROGATION AREA',
      source: 'nald'
    })

    expect(result.param1).to.equal('DEROGATION AREA')
  })

  it('will return an error if it is sent an object with an invalid param1', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId: `9:${randomInteger(100, 99999)}`,
      param1: null,
      source: 'nald'
    })

    expect(result).to.equal('"param1" must be a string')
  })

  it('will not return an error if it is sent an object with a valid param2', async () => {
    const externalId = `9:${randomInteger(100, 99999)}`
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId,
      param2: 'DEROGATION AREA',
      source: 'nald'
    })

    expect(result.param2).to.equal('DEROGATION AREA')
  })

  it('will return an error if it is sent an object with an invalid param2', async () => {
    const result = await LicenceVersionPurposeConditionService.go({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionTypeId,
      externalId: `9:${randomInteger(100, 99999)}`,
      param2: null,
      source: 'nald'
    })

    expect(result).to.equal('"param2" must be a string')
  })
})
