'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const CreateLicenceSupplementaryYearService = require('../../../../app/services/licences/supplementary/create-licence-supplementary-year.service.js')
const DetermineChargeVersionYearsService = require('../../../../app/services/licences/supplementary/determine-charge-version-years.service.js')
const DetermineExistingBillRunYearsService = require('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
const DetermineReturnLogYearsService = require('../../../../app/services/licences/supplementary/determine-return-log-years.service.js')
const DetermineWorkflowYearsService = require('../../../../app/services/licences/supplementary/determine-workflow-years.service.js')

// Thing under test
const ProcessSupplementaryBillingFlagService = require('../../../../app/services/licences/supplementary/process-billing-flag.service.js')

describe('Process Billing Flag Service', () => {
  let licenceData
  let notifierStub
  let payload

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    Sinon.stub(CreateLicenceSupplementaryYearService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a valid payload', () => {
    before(async () => {
      licenceData = {
        licence: {
          id: '216c3981-2e8d-4158-96de-0c8174d54077',
          regionId: '0b962987-a338-4bc2-843f-c11a7ffa6c7c'
        },
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31'),
        twoPartTariff: false,
        flagForBilling: false
      }
    })

    describe('with a charge version id', () => {
      before(async () => {
        payload = {
          chargeVersionId: 'a9e62338-8053-4bde-9344-def69f5ca416'
        }
      })

      describe('that should not be flagged for supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineChargeVersionYearsService, 'go').resolves(licenceData)
        })

        it('does not call CreateLicenceSupplementaryYearService', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          expect(CreateLicenceSupplementaryYearService.go.called).to.be.false()
        })
      })

      describe('that should be flagged for supplementary billing', () => {
        beforeEach(async () => {
          licenceData.twoPartTariff = true
          licenceData.flagForBilling = true

          Sinon.stub(DetermineChargeVersionYearsService, 'go').resolves(licenceData)
          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('calls CreateLicenceSupplementaryYearService to handle persisting the flagged years', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          expect(CreateLicenceSupplementaryYearService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })
    })

    describe('with a return id', () => {
      before(async () => {
        payload = {
          returnId: 'a9e62338-8053-4bde-9344-def69f5ca416'
        }
      })

      describe('that should not be flagged for supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineReturnLogYearsService, 'go').resolves(licenceData)
        })

        it('does not call CreateLicenceSupplementaryYearService', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          expect(CreateLicenceSupplementaryYearService.go.called).to.be.false()
        })
      })

      describe('that should be flagged for supplementary billing', () => {
        beforeEach(async () => {
          licenceData.twoPartTariff = true
          licenceData.flagForBilling = true

          Sinon.stub(DetermineReturnLogYearsService, 'go').resolves(licenceData)
          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('calls CreateLicenceSupplementaryYearService to handle persisting the flagged years', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          expect(CreateLicenceSupplementaryYearService.go.called).to.be.true()
        })
      })
    })

    describe('with a workflow id', () => {
      before(() => {
        payload = {
          workflowId: 'a9e62338-8053-4bde-9344-def69f5ca416'
        }
      })

      describe('that should not be flagged for supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineWorkflowYearsService, 'go').resolves(licenceData)
        })

        it('does not call CreateLicenceSupplementaryYearService', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          expect(CreateLicenceSupplementaryYearService.go.called).to.be.false()
        })
      })

      describe('that should be flagged for supplementary billing', () => {
        beforeEach(async () => {
          licenceData.twoPartTariff = true
          licenceData.flagForBilling = true

          Sinon.stub(DetermineWorkflowYearsService, 'go').resolves(licenceData)
          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('calls CreateLicenceSupplementaryYearService to handle persisting the flagged years', async () => {
          await ProcessSupplementaryBillingFlagService.go(payload)

          expect(CreateLicenceSupplementaryYearService.go.called).to.be.true()
        })
      })
    })
  })

  describe('when given an invalid payload', () => {
    describe('with no ids', () => {
      before(() => {
        payload = {}
      })

      it('returns without throwing an error', async () => {
        await ProcessSupplementaryBillingFlagService.go(payload)

        expect(CreateLicenceSupplementaryYearService.go.called).to.be.false()
      })
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      // To make the service fail, we have passed it a charge version that doesn't exist in the db
      payload = {
        chargeVersionId: '5db0060a-69ae-4312-a363-9cb580d19d92'
      }
    })

    it('handles the error', async () => {
      await ProcessSupplementaryBillingFlagService.go(payload)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Supplementary Billing Flag failed')
      expect(args[1]).to.equal(payload)
      expect(args[2]).to.be.an.error()
    })
  })
})
