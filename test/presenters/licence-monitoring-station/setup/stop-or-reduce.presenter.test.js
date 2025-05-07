'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StopOrReducePresenter = require('../../../../app/presenters/licence-monitoring-station/setup/stop-or-reduce.presenter.js')

describe('Licence Monitoring Station Setup - Stop Or Reduce presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '56b6545a-c8e9-4ecd-95fb-927677954f22',
      label: 'Monitoring Station Label',
      monitoringStationId: 'e1c44f9b-51c2-4aee-a518-5509d6f05869'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = StopOrReducePresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/licence-monitoring-station/setup/56b6545a-c8e9-4ecd-95fb-927677954f22/threshold-and-unit',
        monitoringStationLabel: 'Monitoring Station Label',
        pageTitle: 'Does the licence holder need to stop or reduce at this threshold?',
        sessionId: '56b6545a-c8e9-4ecd-95fb-927677954f22',
        stopOrReduce: null,
        reduceAtThreshold: null
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = StopOrReducePresenter.go(session)

        expect(result.backLink).to.equal(
          '/system/licence-monitoring-station/setup/56b6545a-c8e9-4ecd-95fb-927677954f22/check'
        )
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "Threshold And Unit" page', () => {
        const result = StopOrReducePresenter.go(session)

        expect(result.backLink).to.equal(
          '/system/licence-monitoring-station/setup/56b6545a-c8e9-4ecd-95fb-927677954f22/threshold-and-unit'
        )
      })
    })
  })

  describe('the "stopOrReduce" property', () => {
    describe('when the user has previously selected stop or reduce', () => {
      beforeEach(() => {
        session.stopOrReduce = 'stop'
      })

      it('returns the "stopOrReduce" property populated to re-select the option', () => {
        const result = StopOrReducePresenter.go(session)

        expect(result.stopOrReduce).to.equal('stop')
      })
    })
  })

  describe('the "reduceAtThreshold" property', () => {
    describe('when the user has previously selected reduce at threshold', () => {
      beforeEach(() => {
        session.reduceAtThreshold = 'yes'
      })

      it('returns the "reduceAtThreshold" property populated to re-select the option', () => {
        const result = StopOrReducePresenter.go(session)

        expect(result.reduceAtThreshold).to.equal('yes')
      })
    })
  })
})
