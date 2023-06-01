'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const CompressedTarBallService = require('../../../app/services/db-export/compressed-tarball.service.js')
const DeleteFolderService = require('../../../app/services/db-export/delete-folder.service.js')
const ExportCompressedTableService = require('../../../app/services/db-export/export-compressed-table.service.js')
const FetchTableNamesService = require('../../../app/services/db-export/fetch-table-names.service.js')
const SendToS3BucketService = require('../../../app/services/db-export/send-to-s3-bucket.service.js')

// Thing under test
const SchemaExportService = require('../../../app/services/db-export/schema-export.service.js')

describe('Schema export service', () => {
  let FetchTableNamesServiceStub
  let CompressedTarballServiceStub
  let SendToS3BucketServiceStub
  let DeleteFolderServiceStub
  let ExportCompressedTableServiceStub

  beforeEach(() => {
    FetchTableNamesServiceStub = Sinon.stub(FetchTableNamesService, 'go').resolves([])
    CompressedTarballServiceStub = Sinon.stub(CompressedTarBallService, 'go').resolves('/tmp/water')
    SendToS3BucketServiceStub = Sinon.stub(SendToS3BucketService, 'go').resolves()
    DeleteFolderServiceStub = Sinon.stub(DeleteFolderService, 'go').resolves()
    ExportCompressedTableServiceStub = Sinon.stub(ExportCompressedTableService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('calls the different services that export a schema', async () => {
    await SchemaExportService.go('water')

    expect(FetchTableNamesServiceStub.called).to.be.true()
    expect(CompressedTarballServiceStub.called).to.be.true()
    expect(SendToS3BucketServiceStub.called).to.be.true()
    expect(DeleteFolderServiceStub.called).to.be.true()
  })

  it('calls the ExportCompressedTableService with the different table names as arguments', async () => {
    const tableNames = []

    await SchemaExportService.go('water')

    const allArgs = ExportCompressedTableServiceStub.getCalls().flatMap((call) => {
      return call.args
    })

    expect(allArgs).to.equal(tableNames)
  })

  it('creates a folder name for the schema table files to be saved in', async () => {
    const schemaName = 'water'
    const expectedFolderPath = ['/tmp/water']

    await SchemaExportService.go(schemaName)

    const args = SendToS3BucketServiceStub.getCalls().flatMap((call) => {
      return call.args
    })

    expect(args).to.equal(expectedFolderPath)
  })
})
