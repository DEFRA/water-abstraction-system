'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { generateUUID } = require('../../app/lib/general.lib.js')
const {
  determineCycleDueDate,
  determineCycleEndDate,
  determineCycleStartDate
} = require('../../app/lib/return-cycle-dates.lib.js')
const ReturnCycleModel = require('../../app/models/return-cycle.model.js')

async function seed() {
  const today = new Date()
  const day = today.getDay()
  const month = today.getMonth()
  const year = today.getFullYear()

  for (let i = 0; i < 5; i++) {
    const determinationDate = new Date(year - i, month, day)

    const summerReturnCycle = _generateReturnCycle(true, determinationDate)
    const allYearReturnCycle = _generateReturnCycle(false, determinationDate)

    await _upsert(summerReturnCycle)
    await _upsert(allYearReturnCycle)
  }
}

function _generateReturnCycle(summer, determinationDate) {
  return {
    id: generateUUID(),
    startDate: determineCycleStartDate(summer, determinationDate),
    endDate: determineCycleEndDate(summer, determinationDate),
    dueDate: determineCycleDueDate(summer, determinationDate),
    summer,
    submittedInWrls: true
  }
}

async function _upsert(cycle) {
  return ReturnCycleModel.query()
    .insert({ ...cycle, createdAt: timestampForPostgres(), updatedAt: timestampForPostgres() })
    .onConflict(['startDate', 'endDate', 'summer'])
    .merge(['dueDate', 'submittedInWrls', 'updatedAt'])
}

module.exports = {
  seed
}
