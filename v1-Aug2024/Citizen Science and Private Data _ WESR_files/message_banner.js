/**
 * @file
 * Defines the behavior of the Message Banner.
 */

(function ($, Drupal, drupalSettings) {

  "use strict";

  /**
   * Message banner behavior.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   If the banner is enabled, check the user's local storage to see if it
   *   should be displayed to them.
   */
  Drupal.behaviors.messageBanner = {
    /**
     * Attach the message banner behavior.
     *
     * @param {object} context
     *   The DOM context.
     */
    attach(context) {
      var settings = drupalSettings.messageBanner;
      var messageBanner = Drupal.messageBanner;

      // If there's no local storage, bail now.
      if (messageBanner.testForLocalStorage() === false) {
        return;
      }

      var bannerLastSavedTime = settings.banner_timestamp;
      var userLastDismissedTime = messageBanner.getUserLastDismissedTime();

      // If the user last dismissed this banner earlier than the time the banner
      // was last saved, then show the banner.
      if (messageBanner.shouldShowBanner(bannerLastSavedTime, userLastDismissedTime)) {
        messageBanner.attachBannerToBody(settings.banner_text, settings.banner_color, context);

        // Add the functionality for hiding the banner.
        $('.message-banner__close-button button', context).click(function () {
          $(this).closest('#message-banner').slideUp(200, function () {
            $(this).remove();
          });
          messageBanner.setUserLastDismissedTime();
        });
      }
    }
  };
}(jQuery, Drupal, drupalSettings));
