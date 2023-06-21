'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const WaterSchemaService = require('../../../../app/services/data/tear-down/water-schema.service.js')
const CrmSchemaService = require('../../../../app/services/data/tear-down/crm-schema.service.js')
const ReturnsSchemaService = require('../../../../app/services/data/tear-down/returns-schema.service.js')
const PermitSchemaService = require('../../../../app/services/data/tear-down/permit-schema.service.js')
const IdmSchemaService = require('../../../../app/services/data/tear-down/idm-schema.service.js')

// Thing under test
const TearDownService = require('../../../../app/services/data/tear-down/tear-down.service.js')

describe('Tear down service', () => {
  let notifierStub
  let waterSchemaServiceStub
  let crmSchemaServiceStub
  let returnsSchemaServiceStub
  let permitSchemaServiceStub
  let idmSchemaServiceStub

  beforeEach(async () => {
    // TearDownService depends on the GlobalNotifier being set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    waterSchemaServiceStub = Sinon.stub(WaterSchemaService, 'go').resolves()
    crmSchemaServiceStub = Sinon.stub(CrmSchemaService, 'go').resolves()
    returnsSchemaServiceStub = Sinon.stub(ReturnsSchemaService, 'go').resolves()
    permitSchemaServiceStub = Sinon.stub(PermitSchemaService, 'go').resolves()
    idmSchemaServiceStub = Sinon.stub(IdmSchemaService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('tears down the schemas', async () => {
    await TearDownService.go()

    const args = notifierStub.omg.firstCall.args

    expect(args[0]).to.equal('Tear down complete')
    expect(args[1].timeTakenMs).to.exist()

    expect(waterSchemaServiceStub.called).to.be.true()
    expect(crmSchemaServiceStub.called).to.be.true()
    expect(returnsSchemaServiceStub.called).to.be.true()
    expect(permitSchemaServiceStub.called).to.be.true()
    expect(idmSchemaServiceStub.called).to.be.true()
  })
})
