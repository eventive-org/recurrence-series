// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
  // import "core-js/fn/array.find"
  // ...

interface IEvent {
  start_time: Date,
  end_time: Date
}
export default class Series {
  private _events: IEvent[];
  constructor(events: IEvent[] = []) {
    this._events = events;
  }
  getEvents() {
    return this._events;
  }
}
