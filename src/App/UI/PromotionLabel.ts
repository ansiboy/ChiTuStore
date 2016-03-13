import site = require('Site');
import app = require('Application');
import ko = require('knockout');

ko.components.register('promotion-label', {
    viewModel: function(params: any) {
        $.extend({ value: '' }, params || {});
        this.types = ko.unwrap(params.value).split('|');
        this.givenText = '满赠';
        this.reduceText = '满减';
        this.discountText = '满折';
        var routeData = app.routes().getRouteData(location.hash.substr(1));
        if (site.env.isIPhone && chitu.Page.getPageName(routeData) != 'Shopping.ShoppingCart') {// && app.currentPage().name() == 'Home.Index'
            this.givenText = '赠';
            this.reduceText = '减';
            this.discountText = '折';
        }
    },
    template:
    '<span data-bind="foreach:types"> \
        <span text="$data"></span>\
        <span data-bind="visible:$data == \'Given\',text:$parent.givenText" class="label label-info" >满赠</span>\
        <span data-bind="visible:$data == \'Reduce\',text:$parent.reduceText" class="label label-success" >满减</span>\
        <span data-bind="visible:$data == \'Discount\',text:$parent.discountText" class="label label-warning" >满折</span>\
    </div>'
}); 
