if (typeof(gettext) == 'undefined') {
    function gettext(i) { return i; };
}

$(function(){
    // Always focus first field of a form OR the search input
    $('form .form-row:eq(0)')
        .find('input, select, textarea, button').eq(0)
        .add('#searchbar').focus();

    $('.module.filter .filterset h3.form-row').bind('click.grappelli', function(){
        $(this).next().toggle();
    });
});


$('.object-tools a[href=history/]').bind('click.grappelli', function(){
    $('<div />').hide().appendTo('body')
        .load($(this).attr('href') +' #content', {}, function(html, rsStatus){
            $(this).dialog({
                width:  700,
                title:  $(this).find('h1:first').hide().text(),
                height: 300        
            }).show();
        })
    return false;
});

// TIME PICKER


$.widget('ui.gTimeField', {
    _init: function() {
        var ui = this;
        var picker = $('<div class="clockbox module"><h2 class="clock-title" /><ul class="timelist" /><p class="clock-cancel"><a href="#" /></p></div>')
            .appendTo('body')
            .find('h2').text(gettext('Choose a time')).end()
            .find('a').text(gettext('Cancel')).end()
            .css({ display:  'none', position: 'absolute'});

        var button = $('<img />')
                        .attr('src', ui.options.buttonImage)
                        .attr('alt', gettext('Clock'))
                        .wrap('<a href="#" />')
                            .attr('title', gettext('Clock'))
                            .insertAfter(ui.element)
                            .bind('click.grappelli', function(){
                                var pos = $(this).offset();
                                if (picker.is(':visible')) {
                                    picker.hide();
                                    $('body').unbind('click.gTimeField');
                                }
                                else {
                                    $('.clockbox.module:visible').hide();
                                    picker.show().css({
                                        top: pos.top - picker.height()/2,
                                        left: pos.left + 20
                                    });
                                    $('body').bind('click.gTimeField', function(e){
                                        var target = $(e.originalTarget);
                                        if (!target.hasClass('clock-title')) {
                                           picker.hide(); 
                                        }
                                    });
                                }
                            })
                            .parent().click(function(){ return false; })

        $.each(ui.options.buttons, function(){
            var button = this;
            $('<li><a href="#"></a></li>').find('a')
                .text(button.label).bind('click.grappelli', function(e){
                    button.callback.apply(this, [e, ui]);
                    picker.hide();
                    return false;
                }).end()
                .appendTo(picker.find('.timelist'));
        });

        $('input, textarea, select').bind('focus.gTimeField', function(){
            $('.clockbox.module:visible').hide();
        });
    }         
});

$.ui.gTimeField.defaults = {
    buttonImage:     ADMIN_MEDIA_PREFIX +'img/icons/icon-clock.png',
    buttons: [
        {label: gettext("Now"), callback: function(e, ui){ 
            return ui.element.val(new Date().getHourMinuteSecond()); 
        }},
        {label: gettext("Midnight"), callback: function(e, ui){ 
            return ui.element.val('00:00:00'); 
        }},
        {label: gettext("6 a.m."), callback: function(e, ui){ 
            return ui.element.val('06:00:00'); 
        }},
        {label: gettext("Noon"), callback: function(e, ui){ 
            return ui.element.val('12:00:00'); 
        }}
    ]
};

// DATE PICKER

$.datepicker.setDefaults({
    dateFormat:      'yy-mm-dd',
    buttonImageOnly: true,
    showOn:          'button',
    showButtonPanel: true, 
    closeText:       gettext('Cancel'),
    buttonImage:     ADMIN_MEDIA_PREFIX +'img/icons/icon-calendar.png'
});

$.widget('ui.gDateField', {
    _init: function() {
        var ui = this;
        ui.element;
        ui.element.datepicker(ui.options.datepicker)
            .parent().find('br').replaceWith('<span class="spacer" />').end()
                .find('img')
                    .attr('alt', gettext('Calendar'))
                    .attr('title', gettext('Calendar')).wrap('<span />').wrap('<a />')
                    .hover(function(){
                        $(this).attr('src', $(this).attr('src').replace('.png', '-hover.png'));
                    }, function(){
                        $(this).attr('src', $(this).attr('src').replace('-hover.png', '.png'));
                    }).parent().click(function(){ return false; });
    }
});

// ACTIONS

$.widget('ui.gActions', {
    _init: function() {
        var ui = this;
        $('#action-toggle').show().bind('click.grappelli', function(){
            ui.element.find('.result-list input.action-select').attr('checked', $(this).attr('checked'));
        
        });
    }
});


// BOOKMARKS

$.widget('ui.gBookmarks', {
         
    _init: function() {
        var ui  = this;
        var url = ui.options.url +'?path='+ window.location.pathname +' #bookmarks > li';
        
        this.showMethod = this.options.effects && 'slideDown' || 'show';
        this.hideMethod = this.options.effects && 'slideUp' || 'hide';

        $("li#toggle-bookmarks-listing.enabled")
            .live("mouseover", function(){ ui.show("#bookmarks-listing:hidden"); });
        
        $('#toggle-bookmark-add').live("click", function() { return ui.add(); });
        $('#bookmark-add-cancel').live("click", function() { return ui.cancel(); });
        ui.element.load(url);
    },

    show: function(el) {
        var ui = this;
        $(el)[ui.showMethod]();
        $("#bookmarks").one("mouseleave", function(){ 
            ui.hide("#bookmarks-listing:visible"); 
        });
    },

    hide: function(el) {
        $(el)[this.hideMethod]();
    },

    cancel: function() {
        this.hide("#bookmark-add");
        $("#toggle-bookmarks-listing").toggleClass('enabled');
        return false;
    },
    
    add: function() {
        $("#bookmark-title").val($('h1').text());
        $("#bookmark-path").val(window.location.pathname);
        $("#toggle-bookmarks-listing").removeClass('enabled');
        this.show("#bookmark-add");
        return false;
    }
});

$.ui.gBookmarks.defaults = {
    url: '/grappelli/bookmark/get/',
    effects: false
};

// CHANGELIST

$.widget('ui.gChangelist', {
    _init: function() {
        var ui = this;
          
        this.table   = ui.element.find('table');
        this.content = ui.element;
        
        // TICKET #11447: td containing a.add-another need.nowrap
        $('table a.add-another').parent('td').addClass('nowrap');

        $('.filterset h3').click(function() {
            $(this).parent()
                .toggleClass('collapse-closed')
                .toggleClass('collapse-open').end()
                .next().next().toggle();
        });
        $('input.search-fields-verbose').click(function() {
            $(this).val('').removeClass("search-fields-verbose");
        });
    
        // SUBMIT FORM WITHOUT "RUN"-BUTTON
        $('div.actions select').change(function(){
            if ($(this).val()) {
                $('div.changelist-content form').submit();
            }
        });

        $(window).resize(function(){ ui.redraw(); });
        ui.redraw();
    },

    /// CHANGELIST functions
    /// in order to prevent overlapping between the result-list
    /// and the sidebar, we insert a horizontal scrollbar instead.
    redraw: function() {
        var ui = this;
        var tw = ui.table.outerWidth();
        var cw = ui.content.outerWidth();

        if (tw > cw) {
            $('#changelist.module.filtered').css('padding-right', 227);
            $('.changelist-content').css('min-width', (tw + 1) +'px');
            $('#changelist-filter').css('border-right', '15px solid #fff');
        }
        if (tw < cw) {
            $('#changelist.module.filtered').css('padding-right', 210);
            $('.changelist-content').css('min-width', 'auto');
            $('#changelist-filter').css('border-right', 0);
        }
    }
});

// INLINE GROUP 

$.widget('ui.gInlineGroup', {
    _init: function(){
        var ui = this;
        ui.element.find('input[name*="DELETE"]').hide();
        if (ui.options.collapsibleGroups) {
            ui._makeCollapsibleGroups();
        }
        else {
            ui.element.filter('.collapse-closed')
                .removeClass('collapse-closed collapsed')
                .addClass('collapse-op');
        }

        // Prevent fields of inserted rows from triggering errors if un-edited
        ui.element.parents('form').bind('submit.gInlineGroup', function(){
            ui.element.find('.inline-related:not(.has_original):not(.has_modifications) div.order :text').val('');
        });
 
        /// ADD HANDLER
        ui.element.find('a.addhandler').bind('click.gInlineGroup', function(){
            var container = $(this).parents('div.inline-group');
            var lastitem  = container.find('div.inline-related:last');
            var newitem   = lastitem.clone(true).appendTo(container.find('div.items:first'));
            var count     = parseInt(container.find('div.inline-related').length, 10);
            var header    = newitem.find('h3:first');
            
            // update new item's header (inline-stacked only)
            if (header.get(0) && container.hasClass('inline-stacked')) {
                header.html("<b>" + $.trim(header.text()).replace(/(\d+)$/, count) + "</b>");
            }
            else {
                header.remove(); // fix layout bug in inline-tabular
            }
            
            /// set TOTAL_FORMS to number of items
            container.find('input[id*="TOTAL_FORMS"]').val(count);

            ui._initializeItem(newitem, count);

            return false;
        });
        
        /// DELETEHANDLER
        ui.element.find('a.deletelink').bind("click.gInlineGroup", function() {
            var cp = $(this).prev(':checkbox');
            cp.attr('checked', !cp.attr('checked'));
            $(this).parents('div.inline-related').toggleClass('predelete');
            return false;
        });

        // Autodiscover if sortable
        //if (ui.element.find('.order').get(0)) {
            ui._makeSortable();
        //}

        ui.element.find('.addhandler').bind('click.gInlineGroup', function(){
            ui._refreshOrder();
        });

        ui._refreshOrder();
    },

    _initializeItem: function(el, count){

        /// replace IDs, NAMEs, HREFs & FORs ...
        el.find(':input,span,table,iframe,label').each(function() {
            var $el = $(this);
            $.each(['id', 'name', 'for'], function(i, k){
                if ($el.attr(k)) {
                    $el.attr(k, $el.attr(k).replace(/-\d+-/g, '-'+  (count - 1) +'-'));
                }
            });
        });

        // Destroy and re-initialize datepicker (for some reason .datepicker('destroy') doesn't seem to work..)
        el.find('.vDateField').unbind().removeClass('hasDatepicker')
            .next().remove().end().end()
            .find('.vTimeField').unbind().next().remove().end().end()
            .find('.datetime').gDatetimeField();


       /// remove error-lists and error-classes
        el.find('ul.errorlist').remove().end()
          .find('.errors, .error').removeClass("errors error");

        /// tinymce
        el.find('span.mceEditor').each(function(e) {
            var id = this.id.split('_parent')[0];
            $(this).remove();
            el.find('#' + id).css('display', '');
            tinyMCE.execCommand("mceAddControl", true, id);
        });
        
        el.find(':input').val('').end() // clear all form-fields (within form-cells)
          .find("strong").text('');     // clear related/generic lookups

        // Little trick to prevent validation on un-edited fields
        el.find('input, textarea').bind('keypress.gInlineGroup', function(){
              el.addClass('has_modifications');
          }).end()
          .find('select, :radio, :checkbox').bind('keypress.gInlineGroup', function(){
              el.addClass('has_modifications');
          });

        return el;
    },

    // INLINE GROUPS (STACKED & TABULAR)
    _makeCollapsibleGroups: function() {
        var ui = this;
        ui.element.filter('.collapse-closed').addClass("collapsed").end()
            .find('h2:first-child').addClass("collapse-toggle")
            .bind("click.gInlineGroup", function(){
                $(this).parent()
                    .toggleClass('collapsed')
                    .toggleClass('collapse-closed')
                    .toggleClass('collapse-open');
                });
    },
    
    _makeSortable: function() {
        var ui   = this;
        var grip = $('<span class="ui-icon ui-icon-grip-dotted-vertical" />');
        //ui.element.find('.order').hide();
        if (ui.element.hasClass('inline-stacked')) {
            grip.prependTo(ui.element.find('.items .inline-related h3:first-child'));
        }
        else if (ui.element.hasClass('inline-tabular')) {
            grip.prependTo(ui.element.find('.items div.inline-item-tools'));
        }
        ui.element.find('.items')
            .sortable({
            axis: 'y',
            cursor: 'move',
            forcePlaceholderSize: true,
            helper: 'clone',
            opacity: 0.7,
            items: '.inline-related',
            appendTo: ui.element.find('.items'),
            update: function(e, inst){
                ui._refreshOrder();
            }
        });
        //
    },
    _refreshOrder: function() {
        var index = 1;
        var ui = this;
        ui.element.find('.order input[type=text]').each(function(){
            $(this).val(index);
            index++;
            
            if (!$(this).parents('.inline-related').hasClass('has_original')) {
                var tools = $(this).parents('.module').find('ul.inline-item-tools');
                if (tools.get(0)) {
                    if (!tools.find('.deletelink').get(0)) {
                        $('<li><a title="Delete Item" class="deletelink" href="#"/></li>').appendTo(tools)
                            .find('a').bind('click.grappelli', function(){
                                $(this).parents('.inline-related').remove();
                                return false;
                            });
                    }
                }
            }
        });
    }
});

$.ui.gInlineGroup.defaults = {
    collapsibleInlines: true,
    collapsibleGroups:  true,
};

// INLINE STACKED 

$.widget('ui.gInlineStacked', {
    _init: function(){
        var ui = this;

        if (ui.options.collapsible) {
            ui._makeCollapsible();
        }
        else {
            ui.element.find('.inline-related').removeClass("collapsed")
        }

        // FIELDSETS WITHIN STACKED INLINES
        /* OBSOLETE ?
        ui.element.find('.inline-related').find('fieldset[class*="collapse-closed"]')
            .addClass("collapsed").find('h4:first').addClass("collapse-toggle").end()
            .find('fieldset[class*="collapse-open"] h4:first').addClass("collapse-toggle")
            .bind("click", function(e){
                $(this).parent()
                    .toggleClass('collapsed')
                    .toggleClass('collapse-closed')
                    .toggleClass('collapse-open');
        });
        */
    },
    _makeCollapsible: function() {
        var ui = this;
        
        // BUTTONS (STACKED INLINE)
        ui.element.find('a.closehandler').bind("click", function(){
            $(this).parents('div.inline-stacked')
                .addClass('collapsed collapse-closed')
                .removeClass('collapse-open')
                .find('div.inline-related')
                    .removeClass('collapse-open')
                    .addClass('collapsed collapse-closed');
        });
        ui.element.find('a.openhandler').bind("click", function(){
            $(this).parents('div.inline-stacked')
                .removeClass('collapsed collapse-closed')
                .addClass('collapse-open')
                .find('div.inline-related')
                    .removeClass('collapsed collapse-closed')
                    .addClass('collapse-open');
        });
        
        /// OPEN STACKEDINLINE WITH ERRORS (onload)
        $('.inline-related:has(.errors)').removeClass('collapse-closed collapsed').addClass('collapse-open');

        ui.element.find('.inline-related')
            .addClass("collapsed")
            .find('h3:first-child')
                .addClass('collapse-toggle')
                .bind("click", function(){
                    var p = $(this).parent();
                    if (!p.hasClass('collapsed') && !p.hasClass('collapse-closed')) {
                        p.addClass('collapsed')
                         .addClass('collapse-closed')
                         .removeClass('collapse-open');
                    }
                    else {
                        p.removeClass('collapsed')
                         .removeClass('collapse-closed')
                         .addClass('collapse-open');
                    }
                });
    },
});
$.ui.gInlineStacked.defaults = {
    collapsible: true,
};

// INLINE TABULAR

$.widget('ui.gInlineTabular', {
    _init: function(){
        var ui = this;

        ui.element.find('.inline-related h3:first').remove(); // fix layout bug

        /// add predelete class (only necessary in case of errors)
        ui.element.find('input[name*="DELETE"]:checked').each(function(i) {
            $(this).parents('div.inline-related').addClass('predelete');
        });

        /// OPEN TABULARINLINE WITH ERRORS (onload)
        ui.element.filter('.inline-tabular').find('div[class*="error"]:first').each(function(i) {
            $(this).parents('div.inline-tabular').removeClass("collapsed");
        });
    },
});
