var $args = $('#args'),
  args = [],
  keys = [];

// add
addValue = (keyVal) => {
  var name = keyVal[0],
    val = keyVal[1];

  var i = keys.indexOf(name);
  if (i === -1) {
    args.push(keyVal);
    keys.push(name);
  } else {
    args[i][1] = val;
  }
};

//
init = () => {
  console.clear();
  var splitArgs = $args.val().split('&');

  for (let arg of splitArgs) {
    addValue(arg.split('='));
  }

  console.log('» args', args);
  console.log('» keys', keys);
};

$args.keyup(init);

// add / replace values
addValue(['bar', 4]);
addValue(['baz', 10]);
