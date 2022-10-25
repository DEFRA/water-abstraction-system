'use strict'

/**
 * @module ServiceStatusService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const addressFacadeConfig = require('../../config/address_facade.config')

/**
 * Returns data required to populate our `/service-status` page, eg. task activity status, virus checker status, service
 * version numbers, etc.
 *
 * Each data set is returned in the format needed to populate the gov.uk table elements ie. an array containing one
 * array per row, where each row array contains multiple `{ text: '...' }` elements, one for each cell in the row.
*/
class ServiceStatusService {
  static async go () {
    const virusScannerData = await this._getVirusScannerData()
    const redisConnectivityData = await this._getRedisConnectivityData()

    const { got } = await import('got')
    const addressFacadeData = await this._getAddressFacadeData(got)
    const appData = await this._getAppData(got)

    return {
      virusScannerData,
      redisConnectivityData,
      addressFacadeData,
      appData
    }
  }

  /**
   * Receives an array and returns it in the format required by the nunjucks template in the view.
   */
  static _mapArrayToTextCells (rows) {
    return rows.map(row => {
      return row.map(cell => {
        return { text: cell }
      })
    })
  }

  static async _getVirusScannerData () {
    try {
      const { stdout, stderr } = await exec('clamdscan --version')
      return stderr ? `ERROR: ${stderr}` : stdout
    } catch (error) {
      return `ERROR: ${error.message}`
    }
  }

  static async _getRedisConnectivityData () {
    try {
      const { stdout, stderr } = await exec('redis-server --version')
      return stderr ? `ERROR: ${stderr}` : stdout
    } catch (error) {
      return `ERROR: ${error.message}`
    }
  }

  static async _getAddressFacadeData (got) {
    // TODO move the URL into config
    const statusUrl = new URL('/address-service/hola', addressFacadeConfig.url)

    const response = await got.get(statusUrl)

    return response.body
  }

  static async _getChargingModuleData (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8020/status')

    return {
      name: 'Charging module',
      version: response.headers['x-cma-docker-tag'],
      commit: response.headers['x-cma-git-commit']
    }
  }

  static async _getForegroundServiceData (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8001/health/info').json()

    return {
      name: 'Service - foreground',
      version: response.version,
      commit: response.commit,
      jobs: []
    }
  }

  static async _getBackgroundServiceData (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8012/health/info').json()

    return {
      name: 'Service - background',
      version: response.version,
      commit: response.commit,
      jobs: []
    }
  }

  static async _getReportingData (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8011/health/info').json()

    return {
      name: 'Reporting',
      version: response.version,
      commit: response.commit,
      jobs: []
    }
  }

  static async _getImportData (got) {
    const jobs = this._mapArrayToTextCells([
      [
        'Cell 1.1',
        'Cell 1.2'
      ],
      [
        'Cell 2.1',
        'Cell 2.2'
      ]
    ])

    // TODO move the URL into config
    const response = await got.get('http://localhost:8007/health/info').json()

    return {
      name: 'Import',
      version: response.version,
      commit: response.commit,
      jobs
    }
  }

  static async _getTacticalCrm (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8002/health/info').json()

    return {
      name: 'Tactical CRM',
      version: response.version,
      commit: response.commit,
      jobs: []
    }
  }

  static async _getExternalUi (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8000/health/info').json()

    return {
      name: 'External UI',
      version: response.version,
      commit: response.commit,
      jobs: []
    }
  }

  static async _getInternallUi (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8008/health/info').json()

    return {
      name: 'Internal UI',
      version: response.version,
      commit: response.commit,
      jobs: []
    }
  }

  static async _getTacticalIdm (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8003/health/info').json()

    return {
      name: 'Tactical IDM',
      version: response.version,
      commit: response.commit,
      jobs: []
    }
  }

  static async _getPermitRepo (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8004/health/info').json()

    return {
      name: 'Permit repository',
      version: response.version,
      commit: response.commit,
      jobs: []
    }
  }

  static async _getReturns (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8006/health/info').json()

    return {
      name: 'Returns',
      version: response.version,
      commit: response.commit,
      jobs: []
    }
  }

  static async _getAppData (got) {
    const chargingModule = await this._getChargingModuleData(got)
    const foregroundServiceData = await this._getForegroundServiceData(got)
    const backgroundServiceData = await this._getBackgroundServiceData(got)
    const reportingData = await this._getReportingData(got)
    const importData = await this._getImportData(got)
    const tacticalCrm = await this._getTacticalCrm(got)
    const externalUi = await this._getExternalUi(got)
    const internalUi = await this._getInternallUi(got)
    const tacticalIdm = await this._getTacticalIdm(got)
    const permitRepo = await this._getPermitRepo(got)
    const returns = await this._getReturns(got)
    return [
      chargingModule,
      foregroundServiceData,
      backgroundServiceData,
      reportingData,
      importData,
      tacticalCrm,
      externalUi,
      internalUi,
      tacticalIdm,
      permitRepo,
      returns
    ]
  }
}

module.exports = ServiceStatusService
