/// <reference path='../../../Scripts/typings/chitu.d.ts' />
import shopping = require('Services/Shopping');
import mapping = require('knockout.mapping');
import IScroll = require('iscroll');

export = function(page: chitu.Page) {

    var model;

    var productId = page.routeData.values().id;
    var result = shopping.getProductIntroduce(productId).done((data) => {
        if (model == null) {
            model = mapping.fromJS(data);
            ko.applyBindings(model, page.node);
        }
        else {
            mapping.fromJS(data, {}, model);
        }
    })

    page.viewChanged.add(() => {
        (<chitu.IScrollView>page.findControl('introduce')).load.add(() => result);
    });
} 