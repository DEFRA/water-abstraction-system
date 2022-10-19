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
    const importData = await this._getImportData()
    const virusScannerData = await this._getVirusScannerData()
    const cacheConnectivityData = await this._getCacheConnectivityData()
    const serviceVersionsData = await this._getServiceVersionsData()

    return {
      importRows: this._mapArrayToTextCells(importData),
      virusScannerRows: this._mapArrayToStatusCells(virusScannerData),
      cacheConnectivityRows: this._mapArrayToStatusCells(cacheConnectivityData),
      serviceVersionsRows: this._mapArrayToStatusCells(serviceVersionsData)
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

  /**
   * Receives an array of statuses and returns it in the format required by the nunjucks template in the view.
   */
  static _mapArrayToStatusCells (rows) {
    // Map each row in the array we've received
    return rows.map(row => {
      // A status row has only two elements:
      // * The thing having its status reported, which is a standard text cell;
      // * Its status, which is formatted numeric so that it's right justified on its row.
      return [
        { text: row[0] },
        { text: row[1], format: 'numeric' }
      ]
    })
  }

  static async _getImportData () {
    return [
      [
        'Cell 1.1',
        'Cell 1.2',
        'Cell 1.3',
        'Cell 1.4',
        'Cell 1.5'
      ],
      [
        'Cell 2.1',
        'Cell 2.2',
        'Cell 2.3',
        'Cell 2.4',
        'Cell 2.5'
      ]
    ]
  }

  static async _getVirusScannerData () {
    return [
      [
        'Status',
        'OK'
      ]
    ]
  }

  static async _getCacheConnectivityData () {
    return [
      [
        'Status',
        'Connected'
      ]
    ]
  }

  static async _getServiceVersionsData () {
    return [
      [
        'Water service',
        '3.0.1'
      ],
      [
        'IDM',
        '2.25.1'
      ]
    ]
  }
}

module.exports = ServiceStatusService
