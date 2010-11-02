(function ($) {
/**@exports $ as jQuery */
/**
 * Plugin to create custom ui-related bindings for a toolbar control. Uses the 
 *      pattern of lazy-initializing the API and storing an instance of it as a 
 *      data reference to the jQuery object.
 * @constructor
 * @param {?Object=} options Custom overrides to the defaults. 
 * @return {jQuery} Returns an extended jQuery object with the toolbar API methods.
 * @example 
 * $toolbar = jQuery('#the-toolbar').toolbar(); // get the lazy-constructed API
 * $toolbar.hideButton($('#some-button', $toolbar)); // hide the button
 */
$.fn.toolbar = function (options) {    
    var api = this.data(pkg + 'jquery.toolbar');
    if (api) {
        return api;
    }
    var opt = $.extend(true, {}, $.fn.toolbar.defaults, options);
    var sel = opt.selectors;
    // temporary
    $('button[data-href]', this).bind('click', function (evt) {
        var $linkButton = $(this);
        evt.preventDefault();
        window.open($linkButton.attr('data-href'));
    });
    api = {
        /** @methodOf jQuery.fn.toolbar */ 
        hideButton: function ($button) {
            $button.add($button.closest(sel.btnWrap).next(sel.btnSeparator))
                .hide();
        }
    };
    this.data(pkg + 'jquery.toolbar', api);
    $.extend(this, api);
    return this;
};
/** 
 * Properties:
 *      <br/>selectors: btnWrap, btnSeparator
 * @static
 */
$.fn.toolbar.defaults = {};
$.fn.toolbar.defaults.selectors = {
    btnWrap: '.btn-wrap',
    btnSeparator: '.separator'
};
})(jQuery);
