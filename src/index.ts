// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import * as moment from "moment";
import { RRule, rrulestr } from "rrule";
import { Settings } from "luxon";

Settings.defaultZoneName = "utc";
interface IEvent {
  start: Date,
  end: Date
}
interface IOptions {
  maxRepeats: number,
  length: number
}

function getLength(event: IEvent) {
  return moment(event.end).diff(moment(event.start));
}
export default class Series {
  private _events: IEvent[];
  private _created: IEvent[];
  private _updated: IEvent[];
  private _deleted: IEvent[];
  private _options: IOptions;
  
  constructor(events: IEvent[] = [], options: any = {}) {
    this._events = events;
    this._created = [];
    this._updated = [];
    this._deleted = [];
    this._options = {
      maxRepeats: options.maxRepeats || 100,
      length: options.length || (events.length > 1 ? getLength(events[0]): 0)
    };
  }
  getEvents() {
    return this._events;
  }
  getCreated() {
    return this._created;
  }
  getDeleted() {
    return this._deleted;
  }
  getUpdated() {
    return this._updated;
  }
  setRecurrence(rruleString: string) {
    this._updated = [];
    this._created = [];
    this._deleted = [];
    let rrule = rrulestr(rruleString, { forceset: true });
    // todo: when date start is in the past, need to get only events from now -> future.

    let repeats = rrule.all((date, i) => i < this._options.maxRepeats);
    let deleted = [];
    let kept = [];
    let updated = [];
    let created = [];
    for (let event of this._events) {
      let repeatsTimes = repeats.map(e => e.valueOf());
      let matchingRepeat = repeatsTimes.indexOf(moment(event.start).valueOf());
      if (matchingRepeat > -1) {
        repeats.splice(matchingRepeat, 1);
        // Keep event.
        kept.push(event);
      }
      else {
        deleted.push(event);
      }
    }
    this._events = this._events.filter(e => this._deleted.indexOf(e) === -1);
    if (repeats.length > 0) {
      for (let repeat of repeats) {
        let start = moment(repeat).toDate();
        let end = moment(repeat).add(this._options.length).toDate();

        // Modify existing event, if it exists...
        if (deleted.length > 0) {
          let event = deleted.shift() as IEvent;
          event.start = start;
          event.end = end;
          kept.push(event);
          updated.push(event);
        }
        // ...or duplicate the event if a new event has to be created.
        else {
          kept.push({start, end});
          created.push({start, end});
        }
      }
    }
    this._events = kept;
    this._created = created;
    this._updated = updated;
    this._deleted = deleted;

  }
  setLength(length: number) {
    let updated = [];
    this._options.length = length;
    for (let event of this._events) {
      let diff = getLength(event);
      if (diff !== length) {
        event.end = moment(event.start).add(length).toDate();
        updated.push(event);
      }
    }
    this._updated = updated;
  }
}
