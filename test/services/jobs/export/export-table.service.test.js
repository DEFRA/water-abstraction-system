// Test framework dependencies

// Things we need to stub
import FetchTableService from '../../../../app/services/jobs/export/fetch-table.service.js'
import WriteTableToFileService from '../../../../app/services/jobs/export/write-table-to-file.service.js'

// Thing under test
import ExportTableService from '../../../../app/services/jobs/export/export-table.service.js'

describe('Table Export service', () => {
  beforeEach(async () => {
    vi.mock('../../../../app/services/jobs/export/fetch-table.service.js')
    FetchTableService.mockResolvedValue({ headers: [], rows: [] })
    vi.mock('../../../../app/services/jobs/export/write-table-to-file.service.js')
    WriteTableToFileService.mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('runs the db export services', async () => {
    await ExportTableService()

    expect(WriteTableToFileService).toHaveBeenCalled()
    expect(FetchTableService).toHaveBeenCalled()
  })
})
