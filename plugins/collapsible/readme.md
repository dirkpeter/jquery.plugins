# jquery.collapsible.js

## Basic setup
```` javascript
$('.is-collapsible').collapsible({
  open: true
});
````


## Options
Example:

```` javascript
settings: {
  debug: true,
  open: true
}
````

| Option | Type | Default | Info |
|--------|------|---------|------|
| `debug` | bool | `false` | show debug messages eg function calls |
| `trigger` | selector | `'.trigger'` | the trigger selector, must be located inside the init-element |
| `content` | selector | `'.content'` | |
| `triggerClass` | string | `'trigger'` | |
| `contentClass` | string | `'content'` | |
| `open` | bool | `false` | default state on init |
| `classPrefix` | string | `'collapsible-'` | |
| `openClass` | string | `'open'` | |
| `closeClass` | string | `'close'` | |
| `indicatorClass` | string | `'indicator'` | |
| `indicatorParent` | bool or string | `false` | options: `'trigger'`, `'content'` or `'parent'` |
| `openText` | string | `'Show details'` | |
| `closeText` | string | `'Hide details'` | |
| `calcDelta` | function | `function () { return 0; }` | |
| `activeToggle` | bool | `false` | |
| `animated` | bool | `true` | whether or not the collapsing should be animated by JS |



## (public) Functions
_Note: status `true` equals the collapsible is open._

Example:
```` javascript
$('.foo').collapsible('toggle'[, false]);
// return status
````

| Function | Arguments | Return | Info |
|----------|-----------|--------|------|
| `destroy` | _none_ | _none_ | Return the markup to the state before the collapsible was initiated. |
| `getStatus` | _none_ | status (bool) | Returns the current state of the collapsible. |
| `toggle` | `status` (bool) | status (bool) | Toggle the visibility of the content. The `status`-argument can be passed to force a state. |
| `update` | _none_ | status (bool) | 



## Events

| Event | Data | Info |
|-------|------|------|
| `adjust-viewport` | status (bool) | will be triggered, if the viewport needed to be adjusted to show the start of the content |
| `create` | status (bool) |  |
| `before-create` | status (bool) |  |
| `update` | status (bool) |  |
| `before-update` | status (bool) |  |
| `toggle` | status (bool) |  |
| `before-toggle` | current status (bool), new status (bool) |  |
| `init` | status (bool) |  |
| `destroy` | status (bool) |  |
| `before-destroy` | status (bool) |  |


## TODOs
- finish documentation
