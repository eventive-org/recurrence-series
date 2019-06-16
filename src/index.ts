// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

// Hack from https://github.com/palantir/blueprint/issues/959#issuecomment-335965129
let moment = require('moment')
if ('default' in moment) {
  moment = moment['default']
}
import { Settings } from 'luxon'
import { rrulestr } from 'rrule'
;(Settings || {}).defaultZoneName = 'utc'

interface IEvent {
  start: Date
  end: Date
}
interface IOptions {
  maxRepeats: number
  length: number
}

function getLength(event: IEvent) {
  return moment(event.end).diff(moment(event.start))
}
export default class Series {
  private _events: IEvent[]
  private _created: IEvent[]
  private _updated: IEvent[]
  private _deleted: IEvent[]
  private _options: IOptions

  constructor(events: IEvent[] = [], options: any = {}) {
    this._events = events.map(e => ({ ...e }))
    this._created = []
    this._updated = []
    this._deleted = []
    this._options = {
      maxRepeats: options.maxRepeats || 100,
      length: options.length || (events.length > 1 ? getLength(events[0]) : 0)
    }
  }
  getOptions() {
    return { ...this._options }
  }
  getEvents() {
    return this._events.map(e => ({ ...e }))
  }
  getCreated() {
    return this._created.map(e => ({ ...e }))
  }
  getDeleted() {
    return this._deleted.map(e => ({ ...e }))
  }
  getUpdated() {
    return this._updated.map(e => ({ ...e }))
  }
  setRecurrence(rruleString: string) {
    return this.setRecurrencesAndDurations([{ rrule: rruleString }])
  }
  setRecurrencesAndDurations(list: { rrule: string; duration?: number }[]) {
    this._updated = []
    this._created = []
    this._deleted = []
    let kept = []
    let updated = []
    let created = []
    let deleted: IEvent[] = []
    let repeats: { date: Date; duration?: number }[] = []
    for (const { rrule, duration } of list) {
      if (rrule) {
        repeats = [
          ...repeats,
          ...rrulestr(rrule)
            .all((date, i) => i < this._options.maxRepeats)
            .map(date => ({ duration, date }))
        ]
      }
    }
    // todo: when date start is in the past, need to get only events from now -> future.
    for (let event of this._events) {
      let repeatsTimes = repeats.map(e => e.date.valueOf())
      let matchingRepeatIndex = repeatsTimes.indexOf(moment(event.start).valueOf())
      if (matchingRepeatIndex > -1) {
        const { duration } = repeats[matchingRepeatIndex]
        if (duration && getLength(event) !== duration) {
          event.end = moment(event.start)
            .add(duration)
            .toDate()
          updated.push(event)
        }
        // Keep event.
        kept.push(event)
        repeats.splice(matchingRepeatIndex, 1)
      } else {
        deleted.push(event)
      }
    }
    if (repeats.length > 0) {
      for (let { date, duration } of repeats) {
        let start = moment(date).toDate()
        let end = moment(date)
          .add(duration || this._options.length)
          .toDate()

        // Modify existing event, if it exists...
        if (deleted.length > 0) {
          let event = deleted.shift() as IEvent
          event.start = start
          event.end = end
          kept.push(event)
          updated.push(event)
        }
        // ...or duplicate the event if a new event has to be created.
        else {
          kept.push({ start, end })
          created.push({ start, end })
        }
      }
    }
    this._events = kept
    this._created = created
    this._updated = updated
    this._deleted = deleted
  }
  setLength(length: number) {
    let updated = []
    this._options.length = length
    for (let event of this._events) {
      let diff = getLength(event)
      if (diff !== length) {
        event.end = moment(event.start)
          .add(length)
          .toDate()
        updated.push(event)
      }
    }
    this._updated = updated
  }
  split(date: Date) {
    const past = new Series(
      this._events.filter(e => e.start.getTime() < date.getTime()),
      this._options
    )
    const future = new Series(
      this._events.filter(e => e.start.getTime() >= date.getTime()),
      this._options
    )
    return { past, future }
  }
}
