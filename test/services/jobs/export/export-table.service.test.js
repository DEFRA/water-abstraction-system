// Test framework dependencies

// Things we need to stub
import * as FetchTableService from '../../../../app/services/jobs/export/fetch-table.service.js'
import * as WriteTableToFileService from '../../../../app/services/jobs/export/write-table-to-file.service.js'

// Thing under test
import ExportTableService from '../../../../app/services/jobs/export/export-table.service.js'

describe('Table Export service', () => {
  beforeEach(async () => {
    vi.spyOn(FetchTableService, 'default').mockResolvedValue({ headers: [], rows: [] })
    vi.spyOn(WriteTableToFileService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('runs the db export services', async () => {
    await ExportTableService()

    expect(WriteTableToFileService.default).toHaveBeenCalled()
    expect(FetchTableService.default).toHaveBeenCalled()
  })
})
