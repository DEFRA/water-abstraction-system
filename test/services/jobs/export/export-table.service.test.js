// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as FetchTableService from '../../../../src/services/jobs/export/fetch-table.service.js'
import * as WriteTableToFileService from '../../../../src/services/jobs/export/write-table-to-file.service.js'

// Thing under test
import ExportTableService from '../../../../src/services/jobs/export/export-table.service.js'

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
