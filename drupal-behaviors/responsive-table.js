'use strict';

Drupal.behaviors.__THEME__ResponsiveTable = {
  attach: (context) => {
    // cache the head-cell-content
    function collectHeadCellValues($head) {
      const values = [];

      $head.find('tr:first-child')
        .children()
        .each((i, el) => {
          values.push($(el).text());
        });

      return values;
    }

    // set attribute titles to cells so that they can be shown by css
    function setHeadCellValues($rows, values) {
      $rows.each((ri, rel) => {
        $(rel).children()
          .each((ci, cel) => {
            $(cel).attr('title', values[ci]);
          });
      });
    }

    $('table', context)
      .once('responsive-table')
      .each((i, el) => {
        const $table = $(el),
          $head = $table.find('thead');

        if ($head.length) {
          setHeadCellValues($table.find('tbody > tr'), collectHeadCellValues($head));
        }
      });
  }
};
