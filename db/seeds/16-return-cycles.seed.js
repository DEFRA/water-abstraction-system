'use strict'

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { generateUUID } = require('../../app/lib/general.lib.js')
const {
  cycleDueDateByDate,
  cycleEndDateByDate,
  cycleStartDateByDate
} = require('../../app/lib/return-cycle-dates.lib.js')
const ReturnCycleModel = require('../../app/models/return-cycle.model.js')

async function seed() {
  const today = new Date()
  const day = today.getDay()
  const month = today.getMonth()
  const year = today.getFullYear()

  for (let i = 0; i < 5; i++) {
    const date = new Date(year - i, month, day)

    const summerReturnCycle = _generateReturnCycle(date, true)
    const allYearReturnCycle = _generateReturnCycle(date, false)

    await _upsert(summerReturnCycle)
    await _upsert(allYearReturnCycle)
  }
}

function _generateReturnCycle(date, summer) {
  return {
    id: generateUUID(),
    startDate: cycleStartDateByDate(date, summer),
    endDate: cycleEndDateByDate(date, summer),
    dueDate: cycleDueDateByDate(date, summer),
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
