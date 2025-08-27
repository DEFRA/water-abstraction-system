'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const CompressSchemaFolderService = require('../../../../app/services/jobs/export/compress-schema-folder.service.js')
const DeleteFilesService = require('../../../../app/services/jobs/export/delete-files.service.js')
const ExportTableService = require('../../../../app/services/jobs/export/export-table.service.js')
const FetchTableNamesService = require('../../../../app/services/jobs/export/fetch-table-names.service.js')
const SendToS3BucketService = require('../../../../app/services/jobs/export/send-to-s3-bucket.service.js')

// Thing under test
const SchemaExportService = require('../../../../app/services/jobs/export/schema-export.service.js')

describe('Schema export service', () => {
  let FetchTableNamesServiceStub
  let CompressSchemaFolderServiceStub
  let SendToS3BucketServiceStub
  let DeleteFilesServiceStub
  let ExportTableServiceStub

  describe('when successful', () => {
    beforeEach(() => {
      FetchTableNamesServiceStub = Sinon.stub(FetchTableNamesService, 'go').resolves([])
      CompressSchemaFolderServiceStub = Sinon.stub(CompressSchemaFolderService, 'go').resolves('/tmp/water')
      SendToS3BucketServiceStub = Sinon.stub(SendToS3BucketService, 'go').resolves()
      DeleteFilesServiceStub = Sinon.stub(DeleteFilesService, 'go').resolves()
      ExportTableServiceStub = Sinon.stub(ExportTableService, 'go').resolves()
    })

    afterEach(() => {
      Sinon.restore()
    })

    it('calls the different services that export a schema', async () => {
      await SchemaExportService.go('water')

      expect(FetchTableNamesServiceStub.called).to.be.true()
      expect(CompressSchemaFolderServiceStub.called).to.be.true()
      expect(SendToS3BucketServiceStub.called).to.be.true()
      expect(DeleteFilesServiceStub.called).to.be.true()
    })

    it('calls the ExportTableService with the different table names as arguments', async () => {
      const tableNames = []

      await SchemaExportService.go('water')

      const allArgs = ExportTableServiceStub.getCalls().flatMap((call) => {
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

  describe('when an error is thrown', () => {
    let notifierStub

    beforeEach(() => {
      FetchTableNamesServiceStub = Sinon.stub(FetchTableNamesService, 'go')
      SendToS3BucketServiceStub = Sinon.stub(SendToS3BucketService, 'go')
      CompressSchemaFolderServiceStub = Sinon.stub(CompressSchemaFolderService, 'go')
      DeleteFilesServiceStub = Sinon.stub(DeleteFilesService, 'go').resolves()

      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    afterEach(() => {
      Sinon.restore()
      delete global.GlobalNotifier
    })

    it('catches the error', async () => {
      FetchTableNamesServiceStub.rejects(new Error())

      await SchemaExportService.go('water')

      expect(notifierStub.omfg.calledWith('Error: Failed to export schema water')).to.be.true()
      expect(SendToS3BucketServiceStub.called).to.be.false()
      expect(CompressSchemaFolderServiceStub.called).to.be.false()
    })

    it('cleans up the files', async () => {
      await SchemaExportService.go('water')

      expect(DeleteFilesServiceStub.called).to.be.true()
    })
  })
})
