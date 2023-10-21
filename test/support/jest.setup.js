'use strict'

const DatabaseHelper = require('./helpers/database.helper.js')

module.exports = async function (_globalConfig, _projectConfig) {
  await DatabaseHelper.clean()
}
