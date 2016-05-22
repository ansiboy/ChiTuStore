/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />

import ko = require('knockout')
import mapping = require('knockout.mapping')
import account = require('Services/Account')
import ImageFileResize = require('Core/ImageFileResize')
import ImagePreviewer = require('UI/ImagePreview')
import site = require('Site')
import app = require('Application');

requirejs(['css!content/Shopping/ProductEvaluate']);

interface ProductEvaluatePageArguments {
    productImageUrl: string,
    orderDetailId: string
}

class Start {
    selected = ko.observable(true)

}

class Model {
    private page: chitu.Page;
    private imagePreview: ImagePreviewer;

    starts: Array<Start> = []
    score: KnockoutObservable<number>
    imageUrls = ko.observableArray<string>()
    imageDatas = ko.observableArray<string>()
    imageThumbs = ko.observableArray<string>()
    evaluation = ko.observable<string>()
    anonymous = ko.observable<boolean>(true)

    maxImageCount = 6
    minWordCount = 10
    maxWordCount = 100
    productImageUrl = ko.observable<string>()
    orderDetailId = ko.observable<string>()

    constructor(page: chitu.Page) {
        debugger;
        this.page = page;
        for (var i = 0; i < 5; i++) {
            this.starts[i] = new Start();
            this.starts[i].selected(true);
        }

        this.score = ko.observable(this.starts.length);
        var p = this.imagePreview = ImagePreviewer.createInstance();
        p.imageRemoved.add((index) => {
            var item = this.imageUrls()[index];
            this.imageUrls.remove(item);

            var data = this.imageDatas()[index];
            this.imageDatas.remove(data);
        })
    }
    submit = () => {
        var imageDatas = this.imageDatas().join(site.config.imageDataSpliter);
        var imageThumbs = this.imageThumbs().join(site.config.imageDataSpliter);
        var orderDetailId = this.orderDetailId();
        return account.evaluateProduct(orderDetailId, this.score(), this.evaluation(), this.anonymous(), imageDatas, imageThumbs)
            .done((data) => {
                if ((<any>this.page).submited)
                    (<any>this.page).submited(data);

                app.back();
            });

    }
    switchStart = (item: Start) => {
        var MIN_SCORE = 1;
        var score;
        var item_index = 0;
        for (var i = 0; i < this.starts.length; i++) {
            if (item == this.starts[i]) {
                item_index = i;
                break;
            }
        }

        if (item_index == this.score() - 1) {
            if (item.selected()) {
                score = this.score() - 1;
            }
            else {
                score = this.score() + 1;
            }
        }
        else {
            score = item_index + 1;
        }

        if (score < MIN_SCORE)
            score = MIN_SCORE;

        this.score(score);

        for (var i = 0; i < this.starts.length; i++) {
            this.starts[i].selected(i < this.score());
        }
    }
    showImagePage = (item) => {
        var index = $.inArray(item, this.imageUrls());
        this.imagePreview.open({ imageUrls: this.imageUrls(), currentIndex: index });
    }
}

export = function (page: chitu.Page) {
    var model = new Model(page);
    page.load.add((sender, args) => {
        model.productImageUrl(args.productImageUrl);
        model.orderDetailId(args.orderDetailId);
    });

    page.viewChanged.add(() => {
        var e = page.element.querySelector('[type="file"]');
        var imageFileResize = new ImageFileResize(<HTMLInputElement>e, { maxWidth: 800, maxHeight: 800 }, { maxWidth: 100, maxHeight: 100 });
        imageFileResize.imageResized = image_resized

        ko.applyBindings(model, page.element);
    });

    function image_resized(urls: string[], datas: string[], thumbs: string[]) {
        for (var i = 0; i < urls.length; i++)
            model.imageUrls.push(urls[i]);

        for (var i = 0; i < datas.length; i++)
            model.imageDatas.push(datas[i]);

        for (var i = 0; i < thumbs.length; i++)
            model.imageThumbs.push(thumbs[i]);
    }
}

