'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Helpers for DB seeding
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../../../support/helpers/licence-version-purpose-condition-type.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things to stub
const FullConditionPresenter = require('../../../../app/presenters/licence-monitoring-station/setup/full-condition.presenter.js')

// Thing under test
const FullConditionService = require('../../../../app/services/licence-monitoring-station/setup/full-condition.service.js')

const CES_CONDITION_TYPE = LicenceVersionPurposeConditionTypeHelper.select(20)
const NON_CES_CONDITION_TYPE = LicenceVersionPurposeConditionTypeHelper.select(19)

describe('Full Condition Service', () => {
  let licence
  let session
  let conditions

  beforeEach(async () => {
    Sinon.stub(FullConditionPresenter, 'go').returns({
      presenterData: 'mocked'
    })

    licence = await LicenceHelper.add()

    session = await SessionHelper.add({
      data: {
        licenceId: licence.id
      }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the expected output', async () => {
      const result = await FullConditionService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        presenterData: 'mocked'
      })
    })

    describe('and there are relevant conditions', () => {
      beforeEach(async () => {
        conditions = await _generateData(licence, 'current', CES_CONDITION_TYPE)
      })

      it('passes them to the presenter', async () => {
        await FullConditionService.go(session.id)

        const presenterConditions = FullConditionPresenter.go.getCall(0).args[1]
        expect(presenterConditions.length).to.equal(1)
        expect(presenterConditions[0].id).to.equal(conditions[0].id)
      })
    })

    describe('and there are no relevant conditions', () => {
      beforeEach(async () => {
        conditions = await _generateData(licence, 'current', NON_CES_CONDITION_TYPE)
      })

      it('calls the presenter with an empty array for conditions', async () => {
        await FullConditionService.go(session.id)

        const presenterConditions = FullConditionPresenter.go.getCall(0).args[1]
        expect(presenterConditions).to.be.an.array().and.to.be.empty()
      })
    })

    describe('when there is a superseded licence version', () => {
      beforeEach(async () => {
        conditions = [
          ...(await _generateData(licence, 'superseded', CES_CONDITION_TYPE)),
          ...(await _generateData(licence, 'current', CES_CONDITION_TYPE))
        ]
      })

      it('only calls the presenter with the current conditions', async () => {
        await FullConditionService.go(session.id)

        const presenterConditions = FullConditionPresenter.go.getCall(0).args[1]
        expect(presenterConditions.length).to.equal(1)
        expect(presenterConditions[0].id).to.equal(conditions[1].id)
      })
    })
  })
})
async function _generateData(licence, status, conditionType) {
  const licenceVersion = await LicenceVersionHelper.add({
    licenceId: licence.id,
    status
  })

  const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
    licenceVersionId: licenceVersion.id
  })

  return [
    await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeId: licenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: conditionType.id,
      notes: 'Condition A',
      param1: 'P1'
    })
  ]
}
