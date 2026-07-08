// Test framework dependencies

// Things we need to stub
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import * as SchemaExportService from '../../../../app/services/jobs/export/schema-export.service.js'

// Thing under test
import ExportService from '../../../../app/services/jobs/export/export.service.js'

describe('Export Service', () => {
  let notifierStub

  beforeEach(async () => {
    vi.spyOn(SchemaExportService, 'default').mockResolvedValue()
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  it('calls the SchemaExportService with the different schema names', async () => {
    const schemaNames = ['water', 'returns', 'crm', 'crm_v2', 'idm', 'permit']

    await ExportService()

    const allArgs = SchemaExportService.getCalls().flatMap((call) => {
      return call.args
    })

    expect(allArgs).toEqual(schemaNames)
  })

  it('logs the time taken to export the db', async () => {
    await ExportService()

    const args = notifierStub.omg.mock.calls[0]

    expect(args[0]).toEqual('DB export complete')
    expect(args[1].timeTakenMs).toBeDefined()
  })
})
