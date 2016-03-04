import Page = require('Core/Page')

interface ImagePreviewPageArguments {
    imageUrls: string[],
    currentIndex: number
}

class Model {
    private page: ImagePreviewer


    constructor(page: ImagePreviewer) {
        this.page = page;
    }

    back = () => {
        this.page.hide();
    }
    remove = () => {
        var count = this.page.on_imageRemoved();
        if (count == 0)
            this.page.hide();
    }
}

class ImagePreviewer {// extends Page {
    private model: Model = new Model(this)
    private move: Move
    private preX;
    private swiper: Swiper
    private loadHtml: JQueryDeferred<string> = $.Deferred<string>()
    element: HTMLElement;

    imageRemoved = $.Callbacks()

    public on_imageRemoved(): number {
        var swiper = this.swiper;

        var active_index = swiper.activeIndex;
        swiper.removeSlide(active_index);

        this.updateTitle();
        this.imageRemoved.fire([active_index]);

        return swiper.slides.length;
    }

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.style.display = 'none';

        requirejs(['text!UI/ImagePreview.html', 'swiper'], (html, Swiper) => {
            
            this.element.innerHTML = html;

            ko.applyBindings(this.model, this.element);

            var swiper_container = <HTMLElement>this.element.querySelector('.swiper-container');
            var swiper_wraper = <HTMLElement>this.element.querySelector('.swiper-wrapper');

            this.swiper = new Swiper(swiper_container, {
                loop: false,

                pagination: $(this.element).find('[name="ad-pagination"]')[0],
                onSlideChangeEnd: (swiper: Swiper) => {
                    this.updateTitle();
                }
            });

        });
    }

    open(args: ImagePreviewPageArguments) {
        //super.open(args);
        debugger;
        $(this.element).show();
        this.swiper.removeAllSlides();


        var swiper_wraper = <HTMLElement>this.element.querySelector('.swiper-wrapper');
        for (var i = 0; i < args.imageUrls.length; i++) {
            var slide_element = document.createElement('div');
            slide_element.className = 'swiper-slide';
            slide_element.style.textAlign = 'center';
            var img_element = document.createElement('img');
            img_element.className = 'img-full';
            slide_element.appendChild(img_element);
            img_element.src = args.imageUrls[i];


            if (i == args.currentIndex)
                slide_element.className = slide_element.className + ' swiper-slide-active';

            this.swiper.appendSlide(slide_element);
        }

        this.swiper.slideTo(args.currentIndex, 0);
        this.updateTitle();
    }

    private updateTitle() {
        var title_element = <HTMLElement>this.element.querySelector('[name="title"]')
        title_element.innerHTML = (this.swiper.activeIndex + 1) + '/' + this.swiper.slides.length;
    }

    hide() {
        $(this.element).hide();
    }

    close() {
        $(this.element).remove();
    }

    static createInstance(): ImagePreviewer {
        var element = document.createElement('div');
        document.body.appendChild(element);
        var page = new ImagePreviewer(element);
        element.className = element.className + ' UI-ImagePreview';
        return page;
    }
}


export = ImagePreviewer