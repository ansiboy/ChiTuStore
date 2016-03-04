/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
/// <reference path='../../../Scripts/typings/chitu.d.ts' />

import shopping = require('Services/Shopping')

requirejs(['css!content/User/Favors'], function() { });

export = function(page: chitu.Page) {
    var config = {
        pullDown: {}
    }

    var model = {
        favors: ko.observableArray(),
        loading: ko.observable(),
        unfavor: (item) => {
            shopping.unFavorProduct(item.ProductId).done(() => {
                item.Status('UnFavor');
            });
        },
        showProduct: (item) => {
            window.location.href = '#Home_Product_' + ko.unwrap(item.ProductId);
        }
    }
    
    page.viewChanged.add(() => {
        page.findControl('favors').load.add(() => {
            model.loading(true);
            return shopping.getFavorProducts()
                .done((data) => {
                    for (var i = 0; i < data.length; i++) {
                        data[i].Status = ko.observable('Favor');
                        model.favors.push(data[i]);
                    }
                })
                .always(() => {
                    model.loading(false);
                });
        });
        ko.applyBindings(model, page.node);
    });
} 