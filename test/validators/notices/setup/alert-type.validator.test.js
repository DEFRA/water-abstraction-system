// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import AbstractionAlertSessionData from '../../../support/fixtures/abstraction-alert-session-data.fixture.js'

// Thing under test
import AlertTypeValidator from '../../../../app/validators/notices/setup/alert-type.validator.js'

describe('Notices - Setup - Alert Type validator', () => {
  let licenceMonitoringStations
  let licenceMonitoringStationsData
  let payload

  beforeEach(() => {
    payload = {
      alertType: 'reduce'
    }

    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    licenceMonitoringStationsData = [...Object.values(licenceMonitoringStations)]
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    describe('when the restriction type is "stop_or_reduce" and there are no other licence monitoring stations', () => {
      describe('and the alert type is "stop"', () => {
        beforeEach(() => {
          payload = {
            alertType: 'stop'
          }

          licenceMonitoringStationsData = [{ ...licenceMonitoringStations.one, restrictionType: 'stop_or_reduce' }]
        })

        it('returns with errors', () => {
          const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual(
            'There are no thresholds with the stop restriction type, Select the type of alert you need to send'
          )
        })
      })

      describe('and the alert type is not "stop"', () => {
        beforeEach(() => {
          licenceMonitoringStationsData = [{ ...licenceMonitoringStations.one, restrictionType: 'stop_or_reduce' }]
        })

        it('returns with no errors', () => {
          const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

          expect(result.value).toBeDefined()
          expect(result.error).toBeUndefined()
        })
      })
    })
  })

  describe('when called with invalid data', () => {
    describe('and the payload is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the type of alert you need to send')
      })
    })
  })

  describe('when the alert type is "stop"', () => {
    beforeEach(() => {
      payload = {
        alertType: 'stop'
      }
    })

    describe('when called with valid data', () => {
      it('returns with no errors', () => {
        const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('when called with invalid data', () => {
      describe('and the "alertType" is not available', () => {
        beforeEach(() => {
          licenceMonitoringStationsData = [
            {
              ...licenceMonitoringStations.one,
              restrictionType: 'warning'
            }
          ]
        })

        it('returns with errors', () => {
          const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual(
            'There are no thresholds with the stop restriction type, Select the type of alert you need to send'
          )
        })
      })

      describe('and there are no licence monitoring stations', () => {
        beforeEach(() => {
          licenceMonitoringStationsData = []
        })

        it('returns with errors', () => {
          const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual(
            'There are no thresholds with the stop restriction type, Select the type of alert you need to send'
          )
        })
      })
    })
  })

  describe('when the alert type is "reduce"', () => {
    beforeEach(() => {
      payload = {
        alertType: 'reduce'
      }
    })

    describe('when called with valid data', () => {
      it('returns with no errors', () => {
        const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('when called with invalid data', () => {
      describe('and the "alertType" is not available', () => {
        beforeEach(() => {
          licenceMonitoringStationsData = [
            {
              ...licenceMonitoringStations.one,
              restrictionType: 'warning'
            }
          ]
        })

        it('returns with errors', () => {
          const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual(
            'There are no thresholds with the reduce restriction type, Select the type of alert you need to send'
          )
        })
      })

      describe('and there are no licence monitoring stations', () => {
        beforeEach(() => {
          licenceMonitoringStationsData = []
        })

        it('returns with errors', () => {
          const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual(
            'There are no thresholds with the reduce restriction type, Select the type of alert you need to send'
          )
        })
      })
    })
  })

  describe('when the alert type is "warning"', () => {
    beforeEach(() => {
      payload = {
        alertType: 'warning'
      }
    })

    describe('when called with valid data', () => {
      it('returns with no errors', () => {
        const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('when called with invalid data', () => {
      describe('and there are no licence monitoring stations', () => {
        beforeEach(() => {
          licenceMonitoringStationsData = []
        })

        it('returns with errors', () => {
          const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual(
            'There are no thresholds with the warning restriction type, Select the type of alert you need to send'
          )
        })
      })
    })
  })

  describe('when the alert type is "resume"', () => {
    beforeEach(() => {
      payload = {
        alertType: 'resume'
      }
    })

    describe('when called with valid data', () => {
      it('returns with no errors', () => {
        const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('when called with invalid data', () => {
      describe('and there are no licence monitoring stations', () => {
        beforeEach(() => {
          licenceMonitoringStationsData = []
        })

        it('returns with errors', () => {
          const result = AlertTypeValidator(payload, licenceMonitoringStationsData)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual(
            'There are no thresholds with the resume restriction type, Select the type of alert you need to send'
          )
        })
      })
    })
  })
})
