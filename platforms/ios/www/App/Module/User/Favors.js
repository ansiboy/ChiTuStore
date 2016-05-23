var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Shopping'], function (require, exports, shopping) {
    requirejs(['css!content/User/Favors']);
    return (function (_super) {
        __extends(FavorPage, _super);
        function FavorPage() {
            _super.call(this);
            this.config = {
                pullDown: {}
            };
            this.model = {
                favors: ko.observableArray(),
                loading: ko.observable(),
                unfavor: function (item) {
                    shopping.unFavorProduct(item.ProductId).done(function () {
                        item.Status('UnFavor');
                    });
                },
                showProduct: function (item) {
                    window.location.href = '#Home_Product_' + ko.unwrap(item.ProductId);
                }
            };
            this.load.add(this.page_load);
        }
        FavorPage.prototype.page_load = function (sender, args) {
            ko.applyBindings(sender.model, sender.element);
            sender.model.loading(true);
            return shopping.getFavorProducts()
                .done(function (data) {
                for (var i = 0; i < data.length; i++) {
                    data[i].Status = ko.observable('Favor');
                    sender.model.favors.push(data[i]);
                }
            })
                .always(function () {
                sender.model.loading(false);
            });
        };
        return FavorPage;
    })(chitu.Page);
});
