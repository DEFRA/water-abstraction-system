// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import YarStub from '../../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewCheckLicenceMatchesService from '../../../../../app/services/notices/setup/abstraction-alerts/view-check-licence-matches.service.js'

describe('Notices - Setup - Abstraction Alerts - View Check Licence Matches service', () => {
  let licenceMonitoringStations
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    const abstractionAlertSessionData = AbstractionAlertSessionData.get(licenceMonitoringStations)

    sessionData = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStations.one.thresholdGroup,
        licenceMonitoringStations.two.thresholdGroup,
        licenceMonitoringStations.three.thresholdGroup
      ]
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
    yarStub.flash.mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckLicenceMatchesService(session.id, yarStub)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`,
          text: 'Back'
        },
        cancelLink: `/system/notices/setup/${session.id}/abstraction-alerts/cancel`,
        notification: undefined,
        pageTitle: 'Check the licence matches for the selected thresholds',
        pageTitleCaption: 'Death star',
        restrictionHeading: 'Flow and level restriction type and threshold',
        restrictions: [
          {
            abstractionPeriod: '1 February to 1 January',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.one.id}`,
              text: 'Remove'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.one.licence.id,
            licenceRef: licenceMonitoringStations.one.licence.licenceRef,
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '1000m'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.two.id}`,
              text: 'Remove'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.two.licence.id,
            licenceRef: licenceMonitoringStations.two.licence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 1,
            threshold: '100m3/s'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.three.id}`,
              text: 'Remove'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.three.licence.id,
            licenceRef: licenceMonitoringStations.three.licence.licenceRef,
            restriction: 'Stop or reduce',
            restrictionCount: 1,
            threshold: '100m'
          }
        ]
      })
    })

    describe('when there is a notification', () => {
      beforeEach(() => {
        yarStub = YarStub()
        yarStub.flash.mockReturnValue(['Test notification'])
      })

      it('should set the notification', async () => {
        const result = await ViewCheckLicenceMatchesService(session.id, yarStub)

        expect(result.notification).toEqual('Test notification')
      })
    })
  })
})
