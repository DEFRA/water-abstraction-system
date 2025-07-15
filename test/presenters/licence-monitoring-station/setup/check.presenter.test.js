'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CheckPresenter = require('../../../../app/presenters/licence-monitoring-station/setup/check.presenter.js')

describe('Licence Monitoring Station Setup - Check Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: 'b9593e3f-865e-4594-a686-2be8910a876b',
      unit: 'Ml/d',
      label: 'LABEL',
      licenceId: '1f172f20-75c1-484c-9697-5b0c7237d97a',
      threshold: 100,
      licenceRef: 'LICENCE_REF',
      conditionId: '3bc24c6d-7998-40e1-8d01-8d6e093e9297',
      stopOrReduce: 'stop',
      checkPageVisited: true,
      reduceAtThreshold: null,
      monitoringStationId: 'f022a9d9-63b2-4a1c-b15e-171982832152',
      conditionDisplayText: 'CONDITION_DISPLAY_TEXT',
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 12,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1
    }
  })

  describe('when called', () => {
    it('returns page data for the view with default session data', () => {
      const result = CheckPresenter.go(session)

      expect(result).to.equal(
        {
          abstractionPeriod: '1 January to 31 December',
          abstractionPeriodManuallyEntered: false,
          condition: 'CONDITION_DISPLAY_TEXT',
          licenceRef: 'LICENCE_REF',
          monitoringStationLabel: 'LABEL',
          pageTitle: 'Check the restriction details',
          threshold: '100Ml/d',
          type: 'Stop'
        },
        { skip: ['links'] }
      )
    })

    it('returns correct change links', () => {
      const result = CheckPresenter.go(session)

      expect(result.links).to.equal({
        threshold: '/system/licence-monitoring-station/setup/b9593e3f-865e-4594-a686-2be8910a876b/threshold-and-unit',
        type: '/system/licence-monitoring-station/setup/b9593e3f-865e-4594-a686-2be8910a876b/stop-or-reduce',
        licenceNumber: '/system/licence-monitoring-station/setup/b9593e3f-865e-4594-a686-2be8910a876b/licence-number',
        licenceCondition:
          '/system/licence-monitoring-station/setup/b9593e3f-865e-4594-a686-2be8910a876b/full-condition',
        abstractionPeriod:
          '/system/licence-monitoring-station/setup/b9593e3f-865e-4594-a686-2be8910a876b/abstraction-period'
      })
    })

    describe('when "conditionId" is "no_condition"', () => {
      beforeEach(() => {
        session.conditionId = 'no_condition'
      })

      it('correctly sets "abstractionPeriodManuallyEntered" to "true"', () => {
        const result = CheckPresenter.go(session)

        expect(result.abstractionPeriodManuallyEntered).to.be.true()
      })
    })

    describe('when "conditionId" is not "no_condition"', () => {
      beforeEach(() => {
        session.conditionId = 'some_other_condition_id'
      })

      it('correctly sets "abstractionPeriodManuallyEntered" to "false"', () => {
        const result = CheckPresenter.go(session)

        expect(result.abstractionPeriodManuallyEntered).to.be.false()
      })
    })

    describe('when determining the type', () => {
      describe('and "stopOrReduce" is "stop"', () => {
        beforeEach(() => {
          session.stopOrReduce = 'stop'
        })

        it('correctly sets "type" as "Stop"', () => {
          const result = CheckPresenter.go(session)

          expect(result.type).to.equal('Stop')
        })
      })

      describe('and "stopOrReduce" is "reduce"', () => {
        beforeEach(() => {
          session.stopOrReduce = 'reduce'
        })

        describe('and "reduceAtThreshold" is "yes"', () => {
          beforeEach(() => {
            session.reduceAtThreshold = 'yes'
          })

          it('correctly sets "type" as "Reduce with a maximum volume limit"', () => {
            const result = CheckPresenter.go(session)

            expect(result.type).to.equal('Reduce with a maximum volume limit')
          })
        })

        describe('and "reduceAtThreshold" is "no"', () => {
          beforeEach(() => {
            session.reduceAtThreshold = 'no'
          })

          it('correctly sets "type" as "Reduce"', () => {
            const result = CheckPresenter.go(session)

            expect(result.type).to.equal('Reduce')
          })
        })
      })
    })
  })
})
