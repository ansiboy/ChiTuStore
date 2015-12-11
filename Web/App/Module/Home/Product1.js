define(["require", "exports", 'Application', 'Services/Shopping', 'Services/ShoppingCart'], function (require, exports, app, exp1, exp2) {
    var services = $.extend(exp1, exp2);
    exports.func = function (page) {
        /// <param name="page" type="chitu.Page"/>
        requirejs(['ui/ScrollLoad'], function (chitu) {
            debugger;
            chitu.scrollLoad(page, { recordPosition: false });
        });
        var model = {
            count: ko.observable(1),
            decreaseCount: function () {
                var count = model.count();
                if (count == 1)
                    return;
                model.count(new Number(count).valueOf() - 1);
            },
            increaseCount: function () {
                var count = model.count();
                model.count(new Number(count).valueOf() + 1);
            },
            addToShoppingCart: function () {
                var product = model['product'];
                return services.shoppingCart
                    .addItem(product, model.count());
                //.done(function () {
                //    bootbox.alert('成功添加到购物车');
                //})
            },
            //product: new models.product(),
            back: function () {
                app.back().fail(function () {
                    app.redirect('Home_ProductList_category_' + ko.unwrap(model['product'].ProductCategoryId));
                });
            },
        };
        page.load.add(function (sender, args) {
            var productId = args.id;
            var loadProduct = function () {
                return $.when(services.shopping.getProduct(productId), services.shopping.getProductStock(productId))
                    .done(function (product, stock) {
                    product.Stock = stock.Quantity != null ? stock.Quantity : 1000000; //如果 Quantity 没有，则不限库存
                    if (!model['product']) {
                        model['product'] = ko.mapping.fromJS(product);
                        ko.applyBindings(model, page.node());
                    }
                    else {
                        ko.mapping.fromJS(product, {}, model['product']);
                    }
                });
            };
            return loadProduct();
        });
        var mySwiper;
        page.shown.add(function () {
            if (mySwiper)
                return;
            requirejs(['swiper'], function (Swiper) {
                mySwiper = new Swiper($(page.node()).find('[name="productImages"]')[0], {
                    pagination: $(page.node()).find('[name="productImages-pagination"]')[0],
                    onTap: function (swiper, event) {
                        //TODO:以弹出方式显示图片
                    }
                });
            });
        });
    };
});
//# sourceMappingURL=Product1.js.map