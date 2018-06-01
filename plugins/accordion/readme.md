# jquery.accordion.js

## Basic setup

## Options

| Option | Type | Default | Info |
|--------|------|---------|------|
| `animated` | bool | `true` | will be passed to the collapsible plugins |
| `caclDelta` | function | `calcDelta() { return 0; }` | will be passed to the collapsible plugins |
| `current` | int | `0` | initially shown collapsible |
| `content` | selector | `.content` |  |
| `contentClass` | string | `content` |  |
| `debug` | bool | `false` | show debug messages eg function calls |
| `debugCollapsibles` | bool | `false` | debg messages for the collapsibles-plugin |
| `elements` | jQuery Selector | `$()` |  |
| `elementsClass` | string | `element` |  |
| `multiple` | int | `false` | set to allow multiple items to be shown at once |
| `trigger` | selector | `trigger` |  |
| `triggerClass` | string | `trigger` |  |



## (public) Functions

| Function | Arguments | Return | Info |
|----------|-----------|--------|------|
| `goto` | `stepnumber` (int), `isIndex` (bool) | current (int) | set which collapsible should be shown, for passing an index, the second argument needs to be filled |
| `update` | _none_ | current (int) | resets the display of the accordion based on the stored data |
| `getCurrent` | _none_ | current (int) | returns the currently open collapsible |


## Events

| Event | Data | Info |
|-------|------|------|
| `change` | current (int) | will trigger after the current item has changed |
| `init` | current (int) | will trigger when the init process has concluded |
| `update` | current (int) | will trigger when the status of the plugin was restored from the stored staus |



## TODOs
- proper documentation
- add destroy function
