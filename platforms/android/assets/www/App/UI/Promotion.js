define(["require", "exports"], function (require, exports) {
    "use strict";
    ko.components.register('promotion', {
        viewModel: {
            createViewModel: function (params, componentInfo) {
                this.promotion = params.promotion;
                this.status = ko.observable('collapse');
                this.toggle = function (item) {
                    if (item.status() == 'collapse') {
                        item.status('expand');
                    }
                    else {
                        item.status('collapse');
                    }
                };
                return this;
            }
        },
        template: '<div class="media">\
        <div class="media-left" >\
            <span data-bind="visible:promotion.Type() == \'Given\'" class="label label-info" >满赠</span>\
            <span data-bind="visible:promotion.Type() == \'Reduce\'" class="label label-success" >满减</span>\
            <span data-bind="visible:promotion.Type() == \'Discount\'" class="label label-warning" >满折</span>\
        </div>\
        <div data-bind="foreach:promotion.Contents,tap:toggle,click:toggle" class="media-body">\
            <div data-bind="html:Description,visible:$index() == 0 || $parent.status() == \'expand\'" style="margin:0 0 8px 0"></div>\
        </div>\
        <div data-bind="tap:toggle,click:toggle,visible:ko.unwrap(promotion.Contents).length>1" class="media-right">\
            <i data-bind="attr:{class:status()==\'collapse\' ? \'icon-chevron-down\':\'icon-chevron-up\'}" class="icon-chevron-down"></i>\
        </div>\
    </div>'
    });
});
