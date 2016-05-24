var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Shopping'], function (require, exports, shopping) {
    var ProductCommentsPage = (function (_super) {
        __extends(ProductCommentsPage, _super);
        function ProductCommentsPage(html) {
            _super.call(this, html);
            this.model = {
                comments: ko.observableArray()
            };
            this.load.add(this.page_load);
        }
        ProductCommentsPage.prototype.page_load = function (sender, args) {
            ko.applyBindings(sender.model, sender.element);
            return shopping.getProductComments(args.id, 10).done(function (comments) {
                return sender.model.comments(comments);
            });
        };
        return ProductCommentsPage;
    })(chitu.Page);
    return ProductCommentsPage;
});
