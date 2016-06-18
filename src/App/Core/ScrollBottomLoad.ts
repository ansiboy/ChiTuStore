type ScrollLoad = (scrollView: chitu.ScrollView, args: any) => JQueryPromise<any>;

class ScrollViewStatusBar {
    private element: HTMLElement;
    constructor(element: HTMLElement) {
        if (!element) throw chitu.Errors.argumentNull('element');
        this.element = element;
        element.innerHTML =
            '<div name="scrollLoad_loading" style="padding:10px 0px 10px 0px;"> \
        <h5 class="text-center"> \
                <i class="icon-spinner icon-spin"></i><span style="padding-left:10px;">数据正在加载中...</span> \
            </h5> \
    </div>';

    }
    set visible(value: boolean) {
        if (value)
            $(this.element).show();
        else
            $(this.element).hide();
    }
}

/** 实现滚动视图滚动到底部时，加载数据 */
class ScrollBottomLoad {

    private scrollLoad: ScrollLoad;
    private bottomLoading: ScrollViewStatusBar;

    enableScrollLoad = true;

    constructor(scrollView: chitu.ScrollView, scrollLoad: ScrollLoad) {
        if (!scrollView) throw chitu.Errors.argumentNull('scrollView');
        scrollView.scrollEnd.add((sender, args) => this.on_scrollViewScrollEnd(sender, args));
        this.scrollLoad = scrollLoad;
        var $status_bar = $(scrollView.element).find('STATUS-BAR');
        if ($status_bar.length > 0) {
            this.bottomLoading = new ScrollViewStatusBar($status_bar[0]);
        }
    }

    private on_scrollViewScrollEnd(sender: chitu.ScrollView, args: chitu.ScrollArguments) {
        var scrollTop = args.scrollTop;
        var scrollHeight = args.scrollHeight;
        var clientHeight = args.clientHeight;

        //====================================================================

        var deltaH = clientHeight / 3;
        //if (clientHeight + scrollTop < scrollHeight - marginBottom)
        //    return;
        if (scrollTop + scrollHeight - clientHeight > deltaH) {
            return;
        }

        var result = this.scrollLoad(sender, args);
        result.done(() => {
            if (this.bottomLoading != null) {
                this.bottomLoading.visible = this.enableScrollLoad != false;
            }
        })
    }
}

export = ScrollBottomLoad;

