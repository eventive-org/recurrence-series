# recurrence-series

Uses logic from [rrule](https://github.com/jakubroztocil/rrule) to handle logic for updating recurring events.

You have a bunch of events generated from a particular recurrence. But then you change the recurrence -- what do you do? recurrence-series handles this logic for you.

## Sample usage

```js
import Series from "recurrence-series";
import moment from "moment";
import { RRule } from "rrule";

// Initialization with a list of events. Times are in UTC.
const events = [
    {
        start: moment("2019-05-01T03:00:00.000Z").toDate(),
        end: moment("2019-05-01T03:00:00.000Z").toDate()
    },
    {
        start: moment("2019-05-01T03:00:00.000Z").toDate(),
        end: moment("2019-05-01T03:00:00.000Z").toDate()
    }
];
const series = new Series(events, options);

// Set recurrence for event (as an RRule string). If using timezones, tzid should be specified, and dtstart and until should be in the local timezone (in this case, America/Los_Angeles).
const rrule = new RRule({
    freq: RRule.DAILY,
    interval: 1,
    dtstart: moment("2019-05-01T03:00:00.000Z").toDate(),
    until: moment("2019-05-03T03:00:00.000Z").toDate(),
    tzid: "America/Los_Angeles"
});
series.setRecurrence(rrule.toString());
// Get all current events in the series:
series.getEvents()
// Get all events created by the previous operation:
series.getCreated()
// Get all events deleted by the previous operation:
series.getDeleted()

// Set length of all events to a particular duration, keeping the start times constant (and only varying the end time).
series.setLength(moment.duration(2, 'hours').asMilliseconds());
// Get all events updated by the previous operation:
series.getUpdated()


// Split the series into two (includes events that start at the current time).
const {past, future} = series.split(moment("2019-05-02T03:00:00.000Z").toDate());
// Set all future events' length to 1 hour.
future.setLength(moment.duration(2, 'hours').asMilliseconds());

```

## Options config
```
const options = {
    maxRepeats: 100, // Maximum number of repeats generated when applying an rrule to a series.
    length: 10000, // Length in milliseconds of new dates to be added. If not specified, defaults to the length of the first event, or 0.
}
```

## Set multiple rrules and durations
You can set multiple rrules and durations at once with `Series.setRecurrencesAndDurations`:

```
const rrule = new RRule({
    freq: RRule.DAILY,
    interval: 1,
    dtstart: moment("2019-05-01T03:00:00.000Z").toDate(),
    until: moment("2019-05-01T05:00:00.000Z").toDate()
});
const rrule2 = new RRule({
    freq: RRule.DAILY,
    interval: 1,
    dtstart: moment("2019-05-02T03:00:00.000Z").toDate(),
    until: moment("2019-05-03T03:00:00.000Z").toDate()
});
series.setRecurrencesAndDurations([
    {
    rrule: rrule.toString(),
    duration: 1000
    },
    {
    rrule: rrule2.toString(),
    duration: 5000
    },
]);
````