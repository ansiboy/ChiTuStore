var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Shopping', 'knockout.mapping'], function (require, exports, shopping, mapping) {
    var ProductDetailPage = (function (_super) {
        __extends(ProductDetailPage, _super);
        function ProductDetailPage(html) {
            _super.call(this, html);
            this.load.add(this.page_load);
        }
        ProductDetailPage.prototype.page_load = function (sender, args) {
            var productId = args.id;
            var result = shopping.getProductIntroduce(productId).done(function (data) {
                if (sender.model == null) {
                    sender.model = mapping.fromJS(data);
                    ko.applyBindings(sender.model, sender.element);
                }
                else {
                    mapping.fromJS(data, {}, sender.model);
                }
            });
            return result;
        };
        return ProductDetailPage;
    })(chitu.Page);
    return ProductDetailPage;
});
