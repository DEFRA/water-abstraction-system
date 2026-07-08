// Test framework dependencies

// Things we need to stub
import * as CompressSchemaFolderService from '../../../../app/services/jobs/export/compress-schema-folder.service.js'
import * as DeleteFilesService from '../../../../app/services/jobs/export/delete-files.service.js'
import * as ExportTableService from '../../../../app/services/jobs/export/export-table.service.js'
import * as FetchTableNamesService from '../../../../app/services/jobs/export/fetch-table-names.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import * as SendToS3BucketService from '../../../../app/services/jobs/export/send-to-s3-bucket.service.js'

// Thing under test
import SchemaExportService from '../../../../app/services/jobs/export/schema-export.service.js'

describe('Schema export service', () => {
  describe('when successful', () => {
    beforeEach(() => {
      vi.spyOn(FetchTableNamesService, 'default').mockResolvedValue([])
      vi.spyOn(CompressSchemaFolderService, 'default').mockResolvedValue('/tmp/water')
      vi.spyOn(SendToS3BucketService, 'default').mockResolvedValue()
      vi.spyOn(DeleteFilesService, 'default').mockResolvedValue()
      vi.spyOn(ExportTableService, 'default').mockResolvedValue()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('calls the different services that export a schema', async () => {
      await SchemaExportService('water')

      expect(FetchTableNamesService.default).toHaveBeenCalled()
      expect(CompressSchemaFolderService.default).toHaveBeenCalled()
      expect(SendToS3BucketService.default).toHaveBeenCalled()
      expect(DeleteFilesService.default).toHaveBeenCalled()
    })

    it('calls the ExportTableService with the different table names as arguments', async () => {
      const tableNames = []

      await SchemaExportService('water')

      const allArgs = ExportTableService.getCalls().flatMap((call) => {
        return call.args
      })

      expect(allArgs).toEqual(tableNames)
    })

    it('creates a folder name for the schema table files to be saved in', async () => {
      const schemaName = 'water'
      const expectedFolderPath = ['/tmp/water']

      await SchemaExportService(schemaName)

      const args = SendToS3BucketService.getCalls().flatMap((call) => {
        return call.args
      })

      expect(args).toEqual(expectedFolderPath)
    })
  })

  describe('when an error is thrown', () => {
    let notifierStub

    beforeEach(() => {
      vi.spyOn(DeleteFilesService, 'default').mockResolvedValue()

      notifierStub = GlobalNotifierStub()
      globalThis.GlobalNotifier = notifierStub
    })

    afterEach(() => {
      vi.restoreAllMocks()
      delete globalThis.GlobalNotifier
    })

    it('catches the error', async () => {
      vi.spyOn(FetchTableNamesService, 'default').mockRejectedValue(new Error())

      await SchemaExportService('water')

      expect(notifierStub.omfg).toHaveBeenCalledWith('Error: Failed to export schema water')
      expect(SendToS3BucketService.default).not.toHaveBeenCalled()
      expect(CompressSchemaFolderService.default).not.toHaveBeenCalled()
    })

    it('cleans up the files', async () => {
      await SchemaExportService('water')

      expect(DeleteFilesService.default).toHaveBeenCalled()
    })
  })
})
