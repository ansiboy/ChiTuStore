define(["require", "exports", 'move', 'text!Module/Home/ProductList/ProductsFilter.html', 'iscroll', 'Site'], function (require, exports, move, html, IScroll, site) {
    var win_width = $(window).width();
    var width = win_width * site.config.panelWithRate;
    var $html = $(html).appendTo($('#footer'));
    $html.find('.modal-dialog').css('width', width + 'px');
    var show_time = Math.floor(width / site.config.animationSpeed);
    var $wrapper = $html.find('.modal-body');
    var iscroll = new IScroll($wrapper[0]);
    var model = {
        brands: ko.observableArray(),
        cancel: function () {
            var m = move($html.find('.modal-dialog')[0]);
            m.x($(window).width()).duration(show_time).end(function () {
                $html.hide();
            });
        },
        ok: function () {
            $html.hide();
            var and_symbol = ' && ';
            var query_text = '';
            if (model.filter.brandId()) {
                query_text = query_text + and_symbol + 'BrandId = Guid"' + model.filter.brandId() + '"';
            }
            if (model.filter.minPrice()) {
                query_text = query_text + and_symbol + 'Price >= ' + model.filter.minPrice() + 'm';
            }
            if (model.filter.maxPrice()) {
                query_text = query_text + and_symbol + 'Price < ' + model.filter.maxPrice() + 'm';
            }
            if (query_text.length > and_symbol.length) {
                query_text = query_text.substr(and_symbol.length, query_text.length - and_symbol.length);
            }
            model.after_ok.fire({ filter: query_text });
        },
        show: function () {
            $html[0].style.display = 'block';
            var m = move($html.find('.modal-dialog')[0]);
            m.x(width).duration(0).end();
            m.x(0 - width).duration(show_time).end();
        },
        filter: {
            brandId: ko.observable(),
            minPrice: ko.observable(),
            maxPrice: ko.observable(),
        },
        after_ok: $.Callbacks()
    };
    ko.applyBindings(model, $html[0]);
    return model;
});
