'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const Proxyquire = require('proxyquire')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

describe('Compress schema folder service', () => {
  let tarCreateStub
  let CompressSchemaFolderService

  beforeEach(() => {
    tarCreateStub = Sinon.stub().resolves()

    // NOTE: tar is an ESM module which means its exports are live bindings that cannot be changed by the importing
    // module nor stubbed. So, we have to use proxyquire to override the dependency itself with our stubbed version.
    CompressSchemaFolderService = Proxyquire('../../../../app/services/jobs/export/compress-schema-folder.service.js', {
      tar: { create: tarCreateStub }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('creates a compressed tarball from the given schema folder', async () => {
    const schemaFolderPath = '/tmp/water'
    const expectedTarballPath = '/tmp/water.tgz'

    const result = await CompressSchemaFolderService.go(schemaFolderPath)

    expect(tarCreateStub.calledOnce).to.be.true()
    expect(result).to.equal(expectedTarballPath)
  })
})
