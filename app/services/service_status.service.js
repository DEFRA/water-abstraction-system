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
    const addressFacadeData = await this._getAddressFacadeData()

    const { got } = await import('got')
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

  static async _getAddressFacadeData () {
    const statusUrl = new URL('/address-service/hola', addressFacadeConfig.url)

    try {
      const { stdout, stderr } = await exec(`curl -X GET --header 'Accept: text/plain' --silent '${statusUrl.href}'`)
      return stderr ? `ERROR: ${stderr}` : stdout
    } catch (error) {
      return `ERROR: ${error}`
    }
  }

  static async _getServiceData (got) {
    // TODO move the URL into config
    const response = await got.get('http://localhost:8001/health/status').json()

    return {
      name: 'Service',
      version: response.version,
      commit: response.commit,
      jobs: []
    }
  }

  static async _getReportingData () {
    return {
      name: 'Reporting',
      version: '2.25.1',
      commit: '0b860b53a80989868e0532f0b4775df21ed2821b',
      jobs: []
    }
  }

  static async _getImportData () {
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
    return {
      name: 'Import',
      version: '2.25.1',
      commit: '5ce81a4226bab61071c8ab8cf70b2959e759444f',
      jobs
    }
  }

  static async _getAppData (got) {
    const serviceData = await this._getServiceData(got)
    const reportingData = await this._getReportingData()
    const importData = await this._getImportData()
    return [
      serviceData,
      reportingData,
      importData
    ]
  }
}

module.exports = ServiceStatusService
