<!doctype html>
<html class="no-js" lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>jQuery Plugins</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Place favicon.ico in the root directory -->
  <style>
    * {
      box-sizing: border-box;
      font-family: 'Open Sans', sans;
    }

    body {
      padding: 2%;
    }

    h1 {
      text-align: center;
    }

    ul {
      display: flex;
      list-style-type: none;
      margin: 0;
      padding: 0;
      flex-wrap: wrap;
      justify-content: center;
    }

    li {
      min-height: 50px;
      display: flex;
      margin: 1%;
      order: 1;
      width: 100%;
      flex-basis: 200px;
      flex-grow: 1;
    }

    a {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      border: 1px solid #ccc;
      text-decoration: none;
      color: black;
      transition: all .3s ease-in-out;
    }

    a:hover {
      border-color: #8f211f;
      border-width: 5px;
      color: #8f211f;
    }

    em {
      display: block;
      font-style: normal;
      font-weight: bold;
      margin-bottom: .125em;
      text-align: center;
    }

    span {
      color: #999;
      font-size: .8em;
      text-align: center;
      display: block;
    }
  </style>
</head>

<body>
<h1>jQuery Plugins</h1>

<ul>
  <?php
  $dir = '.';
  $sort = [];
  $sites = [];
  $exceptions = ['.', '..', '.DS_Store'];
  $base_path = 'plugins';

  foreach(scandir($base_path) as $dir) {
    if (!in_array($dir, $exceptions) && strpos($dir, '.js') <= 0) {
      $max_time = 0;

      foreach(scandir($base_path . '/' . $dir) as $file) {
        if (!in_array($file, $exceptions) && strpos($file, '.min.js') <= 0) {
          $time = filemtime($file);

          if ($time > $max_time) {
            $max_time = $time;
          }
        }
      }

      array_push($sites, sprintf(
        '<li class="site--%1$s"><a href="%2$s/%1$s"><em>%1$s</em><span>%3$s</span></a></li>',
        $dir,
        $base_path,
        date("d.m.Y H:i", $max_time)
      ));
    }
  }

  echo join("\n", $sites);
  ?>
</ul>

</body>
</html>