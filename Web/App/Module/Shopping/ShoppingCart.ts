import ko = require('knockout');
import mapping = require('knockout.mapping');
import c = require('ui/ScrollLoad');
import shoppingCart = require('Services/ShoppingCart');
import shopping = require('Services/Shopping');
import app = require('Application');
import TopBar = require('ui/TopBar');

requirejs(['css!content/Shopping/ShoppingCart', 'ui/PromotionLabel']);


enum DialogStaus {
    update,
    success,
    fail,
}

var DialogText = Array<string>();
DialogText[DialogStaus.update] = '正在更新中...';
DialogText[DialogStaus.success] = '更新成功';
DialogText[DialogStaus.fail] = '更新新败';

class Model {
    shoppingCartItems: KnockoutObservableArray<any>
    productsCount: KnockoutComputed<number>
    amount: KnockoutComputed<number>
    allChecked: KnockoutComputed<boolean>
    updateDialogText: KnockoutObservable<string> = ko.observable<string>(DialogText[DialogStaus.update])

    get map_conf(): any {
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
        }
    }

    private _page;

    constructor(page: chitu.Page) {
        this._page = page;
        this.shoppingCartItems = ko.observableArray<any>()

        this.productsCount = ko.computed(() => {
            var count = 0;
            var items = this.shoppingCartItems();
            for (var i = 0; i < items.length; i++) {
                if (!ko.unwrap(items[i].Selected) || (ko.unwrap(items[i].Price) <= 0 && ko.unwrap(items[i].Score) <= 0))//productsCount
                    continue;

                count = count + new Number(ko.unwrap(items[i].Count).toString()).valueOf();
            }
            return count;
        })

        this.amount = ko.computed(() => {
            var amount = 0;
            var items = this.shoppingCartItems();
            for (var i = 0; i < items.length; i++) {
                if (!ko.unwrap(items[i].Selected))
                    continue;

                amount = amount + ko.unwrap(items[i].Amount);
            }
            return new Number(amount.toFixed(2)).valueOf();
        })

        this.allChecked = ko.computed({
            read: () => {
                var selectedCount = 0;
                var items = this.shoppingCartItems();
                if (items.length == 0)
                    return false;

                for (var i = 0; i < items.length; i++) {
                    if (ko.unwrap(items[i].Selected))
                        selectedCount = selectedCount + 1;
                }

                return selectedCount == items.length;
            },
            write: () => {
                var allChecked = this.allChecked();
                var items = this.shoppingCartItems();
                for (var i = 0; i < items.length; i++) {
                    items[i].Selected(!allChecked);
                }
            }
        }, this)
    }

    get page(): chitu.Page {
        return this._page;
    }

    increaseCount = (item) => {
        /// <param name="item" type="models.orderDetail"/>
        if (status == Status.updating)
            return;

        var count = item.Count();
        item.Count(new Number(count).valueOf() + 1);
    }
    decreaseCount = (item) => {
        /// <param name="item" type="models.orderDetail"/>
        if (status == Status.updating)
            return;

        var count = item.Count();
        if (count <= 1) {
            var $dlg = $(this.page.nodes().content).find('[name="dlg_confirm_remove"]');
            $dlg.find('[name="product-name"]').html(ko.unwrap(item.Name));
            $dlg.find('[name="confirm"]')[0].onclick = () => {
                shoppingCart.removeItems([ko.unwrap(item.ProductId)]).done((data) => {
                    mapping.fromJS(data, {}, this.shoppingCartItems);
                    $dlg.hide();
                });
            }
            $dlg.find('[name="cancel"]')[0].onclick = () => $dlg.hide();
            $dlg.show();
            return;
        }
        item.Count(new Number(count).valueOf() - 1);
    }

    removeItems = () => {
        var productIds: Array<string> = [];
        var items = this.shoppingCartItems();
        for (var i = 0; i < items.length; i++) {
            if (ko.unwrap(items[i].Selected))
                productIds[i] = ko.unwrap(items[i].ProductId);
        }

        this.dialog.status(DialogStaus.update);
        shoppingCart.removeItems(productIds)
            .done((items) => {
                this.dialog.status(DialogStaus.success);
                mapping.fromJS(items, this.map_conf, this.shoppingCartItems);
            })
            .fail(() => this.dialog.status(DialogStaus.fail));
    }
    buy = () => {
        if (this.productsCount() <= 0)
            return;

        var items = this.shoppingCartItems();
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
            .done((order) => {
                app.redirect('Shopping_OrderProducts_' + order.Id());
                deferred.resolve(order);
            })
            .fail((data) => {
                deferred.reject(data);
            });

        return deferred;
    }

    productUrl = (item) => {
        return '#Home_Product_' + ko.unwrap(item.ProductId);
    }

    check = (item: any) => {
        if (item.Selected())
            item.Selected(false);
        else
            item.Selected(true);
    }

    selectItem = (item) => {
        item['Selected'](!item['Selected']());

        this.dialog.status(DialogStaus.update);
        return shoppingCart.updateItem(item)
            .done((items) => {
                this.dialog.status(DialogStaus.success)
                mapping.fromJS(items, this.map_conf, this.shoppingCartItems);
            })
            .fail(() => this.dialog.status(DialogStaus.fail));
    }

    updateItem = (item) => {

        this.dialog.status(DialogStaus.update);

        shoppingCart.updateItem(item).done((items) => {
            mapping.fromJS(items, this.map_conf, this.shoppingCartItems);

            status = Status.done;
            this.dialog.status(DialogStaus.success);
            if (this._page['iscroller']) {
                setTimeout(() => this._page['iscroller'].refresh());
            }

        }).fail(() => {
            this.dialog.status(DialogStaus.fail);
        });
    }

    checkAll = () => {
        var allChecked = this.allChecked();
        this.dialog.status(DialogStaus.update);
        var result: JQueryPromise<any>;

        this.dialog.status(DialogStaus.update);
        if (allChecked) {
            result = shoppingCart.unselectAll();
        }
        else {
            result = shoppingCart.selectAll();
        }

        return result
            .done((items) => {
                this.dialog.status(DialogStaus.success);
                mapping.fromJS(items, this.map_conf, _model.shoppingCartItems);

            })
            .fail(() => this.dialog.status(DialogStaus.fail));
    }

    get dialog(): any {
        return {
            text: [],
            element: $(this.page.node()).find('[name="dlg_update"]')[0],
            status: (status: DialogStaus) => {
                var text = DialogText[status];
                _model.updateDialogText(text);

                if (status == DialogStaus.update) {
                    var top = ($(window).height() - 200) / 2;
                    $(this.dialog.element).css('top', top + 'px')['modal']();
                }
                else {
                    window.setTimeout(() => $(this.dialog.element)['modal']('hide'), 800);
                }
            }
        }
    }

    loadItems = (): JQueryPromise<any> => {
        return shoppingCart.getItems().done((items) => {
            mapping.fromJS(items, this.map_conf, this.shoppingCartItems);
        });
    }

}

enum Status {
    changed,
    updating,
    done
}


var status: Status;

var _model: Model;
export = function (page: chitu.Page) {
    /// <param name="page" type="chitu.Page"/>
    //_page = page;
    var topbar = <TopBar>page['topbar'];
    if (topbar != null) {
        $(topbar.element).append('<a name="btn_remove" href="javascript:" data-bind="tap:removeItems,click:removeItems">删除</a>');
    }

    var scroll_config = { pullDown: {} };
    //c.scrollLoad(page, scroll_config);

    var model = _model = new Model(page);


    //function setPageSize() {
    //    page.nodes().footer.style.position = 'absolute';
    //    page.nodes().footer.style.top = ($(window).height() - 100) + 'px';
    //}
    //setPageSize();
    //$(window).on('resize', setPageSize);

    page.load.add(function (sender: chitu.Page) {
        return model.loadItems();
    });

    page.viewChanged.add(() => {
        ko.applyBindings(model, page.nodes().container);
    });


};