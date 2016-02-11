/// <reference path='../../../Scripts/typings/chitu.d.ts' />
import shopping = require('Services/Shopping');
import mapping = require('knockout.mapping');
import IScroll = require('iscroll');

export = function (page: chitu.Page) {

    var model;
    page.load.add((sender, args) => {
        var productId = args.id;
        return shopping.getProductIntroduce(productId).done((data) => {
            if (model == null) {
                model = mapping.fromJS(data);
                ko.applyBindings(model, sender.node);
            }
            else {
                mapping.fromJS(data, {}, model);
            }
        })
    })

    page.closing.add(() => {
        var iscroll: IScroll = page['iscroller'];
        if (iscroll) {
            iscroll.scrollTo(0, 0, 0, null);
        }
    });
} 