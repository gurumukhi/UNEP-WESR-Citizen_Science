(function($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.jqAutocompleteFix = {
    attach: function(context, settings) {

      $.ui.autocomplete.prototype._resizeMenu = function () {
        var ul = this.menu.element;
        ul.outerWidth(this.element.outerWidth());
      }

    }
  };

})(jQuery, Drupal, drupalSettings);
