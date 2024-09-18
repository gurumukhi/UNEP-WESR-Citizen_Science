(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.screenProgress = {
    attach: function (context, settings) {
      $('.layout--onecol .block-region-content').once().each(function () {
        var $main = $(this);
        var $sections = $main.find('> section');

        if ($sections.length > 0) {
          $main.append($('<ul>', {
            class: 'screenProgress listReset'
          }));

          for (var i = 0; i < $sections.length; i++) {
            var classes = 'screenProgress__button btnReset';

            if (i == 0) {
              classes += ' -active';
            }

            $main.find('.screenProgress').append($('<li>', {
              class: 'screenProgress__item',
              html: '<button class="' + classes + '"></button>'
            }));
          }
        }
      });
    }
  }

})(jQuery, Drupal, drupalSettings);
