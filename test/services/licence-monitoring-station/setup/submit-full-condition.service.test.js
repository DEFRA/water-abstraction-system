'use strict'

// Test framework dependencies
const Sinon = require('sinon')

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

      expect(session.conditionId).toEqual(payload.condition)
      expect(session.$update.called).toBe(true)
    })

    it('saves the abstraction period', async () => {
      await SubmitFullConditionService.go(session.id, payload)

      expect(session.abstractionPeriodEndDay).toEqual(31)
      expect(session.abstractionPeriodEndMonth).toEqual(3)
      expect(session.abstractionPeriodStartDay).toEqual(1)
      expect(session.abstractionPeriodStartMonth).toEqual(1)
    })

    it('saves the condition display text', async () => {
      await SubmitFullConditionService.go(session.id, payload)

      expect(session.conditionDisplayText).toEqual(
        'LICENCE_VERSION_CONDITION_TYPE_DISPLAY_TITLE 1: NOTES (Additional information 1: PARAM_1) (Additional information 2: PARAM_2)'
      )
    })

    describe('and no_condition was passed in the payload', () => {
      beforeEach(() => {
        payload = { condition: 'no_condition' }
      })

      it('returns true for abstractionPeriod', async () => {
        const result = await SubmitFullConditionService.go(session.id, payload)

        expect(result).toEqual({ abstractionPeriod: true })
      })
    })

    describe('and a UUID was passed in the payload', () => {
      it('returns false for abstractionPeriod', async () => {
        const result = await SubmitFullConditionService.go(session.id, payload)

        expect(result).toEqual({ abstractionPeriod: false })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitFullConditionService.go(session.id, payload)

      expect(result).toEqual({
        error: { text: 'Select a condition' },
        ...pageData
      })
    })
  })
})
