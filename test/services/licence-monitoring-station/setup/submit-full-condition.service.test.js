'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionPurposeConditionHelper = require('../../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeHelper = require('../../../support/helpers/licence-version-purpose.helper.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things to stub
const FetchFullConditionService = require('../../../../app/services/licence-monitoring-station/setup/fetch-full-condition.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')
const FullConditionService = require('../../../../app/services/licence-monitoring-station/setup/full-condition.service.js')

// Thing under test
const SubmitFullConditionService = require('../../../../app/services/licence-monitoring-station/setup/submit-full-condition.service.js')

describe('Licence Monitoring Station Setup - Submit Full Condition Service', () => {
  let payload
  let session
  let sessionData

  const pageData = {
    pageData: 'PAGE_DATA'
  }

  beforeEach(async () => {
    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    const licenceVersionPurpose = await LicenceVersionPurposeHelper.add()
    const licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeId: licenceVersionPurpose.id,
      param1: 'PARAM_1',
      param2: 'PARAM_2',
      notes: 'NOTES'
    })

    payload = {
      condition: licenceVersionPurposeCondition.id
    }

    Sinon.stub(FetchFullConditionService, 'go').resolves([
      {
        ...licenceVersionPurposeCondition,
        abstractionPeriodStartDay: licenceVersionPurpose.abstractionPeriodStartDay,
        abstractionPeriodStartMonth: licenceVersionPurpose.abstractionPeriodStartMonth,
        abstractionPeriodEndDay: licenceVersionPurpose.abstractionPeriodEndDay,
        abstractionPeriodEndMonth: licenceVersionPurpose.abstractionPeriodEndMonth,
        displayTitle: 'LICENCE_VERSION_CONDITION_TYPE_DISPLAY_TITLE'
      }
    ])
    Sinon.stub(FullConditionService, 'go').resolves(pageData)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitFullConditionService.go(session.id, payload)

      expect(session.conditionId).to.equal(payload.condition)
      expect(session.$update.called).to.be.true()
    })

    it('saves the abstraction period', async () => {
      await SubmitFullConditionService.go(session.id, payload)

      expect(session.abstractionPeriodEndDay).to.equal(31)
      expect(session.abstractionPeriodEndMonth).to.equal(3)
      expect(session.abstractionPeriodStartDay).to.equal(1)
      expect(session.abstractionPeriodStartMonth).to.equal(1)
    })

    it('saves the condition display text', async () => {
      await SubmitFullConditionService.go(session.id, payload)

      expect(session.conditionDisplayText).to.equal(
        'LICENCE_VERSION_CONDITION_TYPE_DISPLAY_TITLE 1: NOTES (Additional information 1: PARAM_1) (Additional information 2: PARAM_2)'
      )
    })

    describe('and no_condition was passed in the payload', () => {
      beforeEach(() => {
        payload = { condition: 'no_condition' }
      })

      it('returns true for abstractionPeriod', async () => {
        const result = await SubmitFullConditionService.go(session.id, payload)

        expect(result).to.equal({ abstractionPeriod: true })
      })
    })

    describe('and a UUID was passed in the payload', () => {
      it('returns false for abstractionPeriod', async () => {
        const result = await SubmitFullConditionService.go(session.id, payload)

        expect(result).to.equal({ abstractionPeriod: false })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitFullConditionService.go(session.id, payload)

      expect(result).to.equal({
        error: { text: 'Select a condition' },
        ...pageData
      })
    })
  })
})
