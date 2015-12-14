define(["require", "exports", 'knockout', 'knockout.mapping', 'Services/ShoppingCart', 'Services/Shopping', 'Application'], function (require, exports, ko, mapping, shoppingCart, shopping, app) {
    requirejs(['css!content/Shopping/ShoppingCart', 'ui/PromotionLabel']);
    var DialogStaus;
    (function (DialogStaus) {
        DialogStaus[DialogStaus["update"] = 0] = "update";
        DialogStaus[DialogStaus["success"] = 1] = "success";
        DialogStaus[DialogStaus["fail"] = 2] = "fail";
    })(DialogStaus || (DialogStaus = {}));
    var DialogText = Array();
    DialogText[DialogStaus.update] = '正在更新中...';
    DialogText[DialogStaus.success] = '更新成功';
    DialogText[DialogStaus.fail] = '更新新败';
    var Model = (function () {
        function Model(page) {
            var _this = this;
            this.updateDialogText = ko.observable(DialogText[DialogStaus.update]);
            this.increaseCount = function (item) {
                if (status == Status.updating)
                    return;
                var count = item.Count();
                item.Count(new Number(count).valueOf() + 1);
            };
            this.decreaseCount = function (item) {
                if (status == Status.updating)
                    return;
                var count = item.Count();
                if (count <= 1) {
                    var $dlg = $(_this.page.nodes().content).find('[name="dlg_confirm_remove"]');
                    $dlg.find('[name="product-name"]').html(ko.unwrap(item.Name));
                    $dlg.find('[name="confirm"]')[0].onclick = function () {
                        shoppingCart.removeItems([ko.unwrap(item.ProductId)]).done(function (data) {
                            mapping.fromJS(data, {}, _this.shoppingCartItems);
                            $dlg.hide();
                        });
                    };
                    $dlg.find('[name="cancel"]')[0].onclick = function () { return $dlg.hide(); };
                    $dlg.show();
                    return;
                }
                item.Count(new Number(count).valueOf() - 1);
            };
            this.removeItems = function () {
                var productIds = [];
                var items = _this.shoppingCartItems();
                for (var i = 0; i < items.length; i++) {
                    if (ko.unwrap(items[i].Selected))
                        productIds[i] = ko.unwrap(items[i].ProductId);
                }
                _this.dialog.status(DialogStaus.update);
                shoppingCart.removeItems(productIds)
                    .done(function (items) {
                    _this.dialog.status(DialogStaus.success);
                    mapping.fromJS(items, _this.map_conf, _this.shoppingCartItems);
                })
                    .fail(function () { return _this.dialog.status(DialogStaus.fail); });
            };
            this.buy = function () {
                if (_this.productsCount() <= 0)
                    return;
                var items = _this.shoppingCartItems();
                var productIds = [];
                var quantities = [];
                for (var i = 0; i < items.length; i++) {
                    if (!items[i].Selected())
                        continue;
                    productIds.push(items[i].ProductId());
                    quantities.push(items[i].Count());
                }
                var deferred = $.Deferred();
                shopping.createOrder(productIds, quantities)
                    .done(function (order) {
                    app.redirect('Shopping_OrderProducts_' + order.Id());
                    deferred.resolve(order);
                })
                    .fail(function (data) {
                    deferred.reject(data);
                });
                return deferred;
            };
            this.productUrl = function (item) {
                return '#Home_Product_' + ko.unwrap(item.ProductId);
            };
            this.check = function (item) {
                if (item.Selected())
                    item.Selected(false);
                else
                    item.Selected(true);
            };
            this.selectItem = function (item) {
                item['Selected'](!item['Selected']());
                _this.dialog.status(DialogStaus.update);
                return shoppingCart.updateItem(item)
                    .done(function (items) {
                    _this.dialog.status(DialogStaus.success);
                    mapping.fromJS(items, _this.map_conf, _this.shoppingCartItems);
                })
                    .fail(function () { return _this.dialog.status(DialogStaus.fail); });
            };
            this.updateItem = function (item) {
                _this.dialog.status(DialogStaus.update);
                shoppingCart.updateItem(item).done(function (items) {
                    mapping.fromJS(items, _this.map_conf, _this.shoppingCartItems);
                    status = Status.done;
                    _this.dialog.status(DialogStaus.success);
                    if (_this._page['iscroller']) {
                        setTimeout(function () { return _this._page['iscroller'].refresh(); });
                    }
                }).fail(function () {
                    _this.dialog.status(DialogStaus.fail);
                });
            };
            this.checkAll = function () {
                var allChecked = _this.allChecked();
                _this.dialog.status(DialogStaus.update);
                var result;
                _this.dialog.status(DialogStaus.update);
                if (allChecked) {
                    result = shoppingCart.unselectAll();
                }
                else {
                    result = shoppingCart.selectAll();
                }
                return result
                    .done(function (items) {
                    _this.dialog.status(DialogStaus.success);
                    mapping.fromJS(items, _this.map_conf, _model.shoppingCartItems);
                })
                    .fail(function () { return _this.dialog.status(DialogStaus.fail); });
            };
            this.loadItems = function () {
                return shoppingCart.getItems().done(function (items) {
                    mapping.fromJS(items, _this.map_conf, _this.shoppingCartItems);
                });
            };
            this._page = page;
            this.shoppingCartItems = ko.observableArray();
            this.productsCount = ko.computed(function () {
                var count = 0;
                var items = _this.shoppingCartItems();
                for (var i = 0; i < items.length; i++) {
                    if (!ko.unwrap(items[i].Selected) || (ko.unwrap(items[i].Price) <= 0 && ko.unwrap(items[i].Score) <= 0))
                        continue;
                    count = count + new Number(ko.unwrap(items[i].Count).toString()).valueOf();
                }
                return count;
            });
            this.amount = ko.computed(function () {
                var amount = 0;
                var items = _this.shoppingCartItems();
                for (var i = 0; i < items.length; i++) {
                    if (!ko.unwrap(items[i].Selected))
                        continue;
                    amount = amount + ko.unwrap(items[i].Amount);
                }
                return new Number(amount.toFixed(2)).valueOf();
            });
            this.allChecked = ko.computed({
                read: function () {
                    var selectedCount = 0;
                    var items = _this.shoppingCartItems();
                    if (items.length == 0)
                        return false;
                    for (var i = 0; i < items.length; i++) {
                        if (ko.unwrap(items[i].Selected))
                            selectedCount = selectedCount + 1;
                    }
                    return selectedCount == items.length;
                },
                write: function () {
                    var allChecked = _this.allChecked();
                    var items = _this.shoppingCartItems();
                    for (var i = 0; i < items.length; i++) {
                        items[i].Selected(!allChecked);
                    }
                }
            }, this);
        }
        Object.defineProperty(Model.prototype, "map_conf", {
            get: function () {
                var model = this;
                return {
                    key: function (data) {
                        return ko.utils.unwrapObservable(data.Id);
                    },
                    create: function (options) {
                        var item = mapping.fromJS(options.data);
                        item.Count.subscribe(function (value) {
                            var count = new Number(value).valueOf() || 1;
                            if (count != this.Count())
                                this.Count(count);
                            model.updateItem(this);
                        }, item);
                        return item;
                    }
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "page", {
            get: function () {
                return this._page;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "dialog", {
            get: function () {
                var _this = this;
                return {
                    text: [],
                    element: $(this.page.node()).find('[name="dlg_update"]')[0],
                    status: function (status) {
                        var text = DialogText[status];
                        _model.updateDialogText(text);
                        if (status == DialogStaus.update) {
                            var top = ($(window).height() - 200) / 2;
                            $(_this.dialog.element).css('top', top + 'px')['modal']();
                        }
                        else {
                            window.setTimeout(function () { return $(_this.dialog.element)['modal']('hide'); }, 800);
                        }
                    }
                };
            },
            enumerable: true,
            configurable: true
        });
        return Model;
    })();
    var Status;
    (function (Status) {
        Status[Status["changed"] = 0] = "changed";
        Status[Status["updating"] = 1] = "updating";
        Status[Status["done"] = 2] = "done";
    })(Status || (Status = {}));
    var status;
    var _model;
    return function (page) {
        var topbar = page['topbar'];
        if (topbar != null) {
            $(topbar.element).append('<a name="btn_remove" href="javascript:" data-bind="tap:removeItems,click:removeItems">删除</a>');
        }
        var scroll_config = { pullDown: {} };
        var model = _model = new Model(page);
        page.load.add(function (sender) {
            return model.loadItems();
        });
        page.viewChanged.add(function () {
            ko.applyBindings(model, page.nodes().container);
        });
    };
});
