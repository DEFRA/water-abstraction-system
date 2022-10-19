'use strict'

/**
 * @module ServiceStatusService
 */

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

    const appData = await this._getAppData()

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
    return 'ClamAV 0.103.5/26694/Wed Oct 19 07:58:25 2022'
  }

  static async _getRedisConnectivityData () {
    return 'Redis server v=5.0.7 sha=00000000:0 malloc=jemalloc-5.2.1 bits=64 build=66bd629f924ac924'
  }

  static async _getAddressFacadeData () {
    return 'hola'
  }

  static async _getServiceData () {
    return {
      name: 'Service',
      version: '3.0.1',
      commit: 'a3e1ecec366d0b6a188e3e1ad8b6f733b7e32012',
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

  static async _getAppData () {
    const serviceData = await this._getServiceData()
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
