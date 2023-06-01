'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const tar = require('tar')

// Thing under test
const CompressedTarBallService = require('../../../app/services/db-export/compressed-tarball.service')

describe('Compressed tarball service', () => {
  let tarCreateStub

  beforeEach(() => {
    tarCreateStub = Sinon.stub(tar, 'create').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('creates a compressed tarball from the given schema folder', async () => {
    const schemaFolderPath = '/tmp/water'
    const expectedTarballPath = '/tmp/water.tgz'

    const result = await CompressedTarBallService.go(schemaFolderPath)

    expect(tarCreateStub.calledOnce).to.be.true()
    expect(result).to.equal(expectedTarballPath)
  })
})
