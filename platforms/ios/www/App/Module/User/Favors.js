/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
/// <reference path='../../../Scripts/typings/chitu.d.ts' />
define(["require", "exports", 'Services/Shopping'], function (require, exports, shopping) {
    requirejs(['css!content/User/Favors'], function () { });
    return function (page) {
        var config = {
            pullDown: {}
        };
        var model = {
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
        page.viewChanged.add(function () {
            page.findControl('favors').load.add(function () {
                model.loading(true);
                return shopping.getFavorProducts()
                    .done(function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].Status = ko.observable('Favor');
                        model.favors.push(data[i]);
                    }
                })
                    .always(function () {
                    model.loading(false);
                });
            });
            ko.applyBindings(model, page.node);
        });
    };
});
