var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'chitu', 'Services/Shopping'], function (require, exports, chitu, shopping) {
    "use strict";
    return (function (_super) {
        __extends(ClassPage, _super);
        function ClassPage(html) {
            _super.call(this, html);
            this.model = {
                categories: ko.observableArray(),
            };
            this.load.add(this.page_load);
        }
        ClassPage.prototype.page_load = function (sender, args) {
            ko.applyBindings(sender.model, sender.element);
            return shopping.getCategories().done(function (items) {
                for (var i = 0; i < items.length; i++) {
                    if (!items[i].ImagePath) {
                        items[i].ImagePath = 'content/images/icon_01.png';
                    }
                }
                sender.model.categories(items);
            });
        };
        return ClassPage;
    }(chitu.Page));
});
