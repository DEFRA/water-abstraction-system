// Test framework dependencies

// Things we need to stub
import CrmSchemaService from '../../../../app/services/data/tear-down/crm-schema.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import IdmSchemaService from '../../../../app/services/data/tear-down/idm-schema.service.js'
import PermitSchemaService from '../../../../app/services/data/tear-down/permit-schema.service.js'
import ReturnsSchemaService from '../../../../app/services/data/tear-down/returns-schema.service.js'
import WaterSchemaService from '../../../../app/services/data/tear-down/water-schema.service.js'

// Thing under test
import TearDownService from '../../../../app/services/data/tear-down/tear-down.service.js'

describe('Tear down service', () => {
  let notifierStub
  beforeEach(async () => {
    vi.mock('../../../../app/services/data/tear-down/crm-schema.service.js')
    CrmSchemaService.mockResolvedValue()
    vi.mock('../../../../app/services/data/tear-down/idm-schema.service.js')
    IdmSchemaService.mockResolvedValue()
    vi.mock('../../../../app/services/data/tear-down/permit-schema.service.js')
    PermitSchemaService.mockResolvedValue()
    vi.mock('../../../../app/services/data/tear-down/returns-schema.service.js')
    ReturnsSchemaService.mockResolvedValue()
    vi.mock('../../../../app/services/data/tear-down/water-schema.service.js')
    WaterSchemaService.mockResolvedValue()

    // TearDownService depends on the GlobalNotifier being set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  it('tears down the schemas', async () => {
    await TearDownService()

    const args = notifierStub.omg.firstCall.args

    expect(args[0]).toEqual('Tear down complete')
    expect(args[1].timeTakenMs).toBeDefined()

    expect(CrmSchemaService).toHaveBeenCalled()
    expect(IdmSchemaService).toHaveBeenCalled()
    expect(PermitSchemaService).toHaveBeenCalled()
    expect(ReturnsSchemaService).toHaveBeenCalled()
    expect(WaterSchemaService).toHaveBeenCalled()
  })
})
