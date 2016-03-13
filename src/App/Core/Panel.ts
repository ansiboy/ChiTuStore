
import Page = require('Core/Page');
import move = require('move');

enum Direction {
    Left,
    Right,
    Up,
    Down
}
interface Animation {
    time?: number,
    direction: Direction
}
class Panel {
    static className = 'panel-node';
    static defaultShowTime = 500;
    static defaultHideTime = 500;

    private _width = '100%';
    private _height = '100%';
    private _zindex = '1000';
    private _page: Page;
    private _element: HTMLElement;
    private _bodyNode: HTMLElement;
    private _contentNode: HTMLElement;

    constructor(page: Page) {
        this._page = page;
        this._element = document.createElement('div');
        this._element.style.position = 'abstract';
        this._element.className = Panel.className;
        this._element.style.width = this._width;
        this._element.style.height = this._height;
        this._element.style.zIndex = this._zindex;

        var body_node = this._bodyNode = document.createElement('div');
        this._element.appendChild(body_node);

        document.body.appendChild(this._element);
    }
    get width() {
        return this._element.style.width;
    }
    set width(value: string) {
        this._element.style.width = value;
    }
    get height() {
        return this._element.style.height;
    }
    set height(value: string) {
        this._element.style.height = value;
    }
    get zIndex() {
        return this._element.style.zIndex;
    }
    set zIndex(value: string) {
        this._element.style.zIndex = value;
    }
    get view() {
        return '';
    }
    set view(value: string) {
    }
    show(animation: Animation) {
        if (animation.time == null)
            animation.time = Panel.defaultShowTime;

        var result = $.Deferred();
        var width = this._element.getBoundingClientRect().width;
        move(this._element).x(width).duration(0).end()
            .x(0 - width).duration(animation.time).end(() => {
                result.resolve();
            });
        return result;
    }
    hide(animation: Animation) {
        if (animation.time == null)
            animation.time = Panel.defaultHideTime;

        var result = $.Deferred();
        var width = this._element.getBoundingClientRect().width;
        move(this._element).x(width).duration(animation.time).end(() => {
            this._element.style.display = 'none';
            result.resolve();
        });
        return result;
    }
    load: () => JQueryPromise<any>
    private on_load(args) {
        if (this.load)
            this.load();
    }
    open(args: any, animation: Animation) {
        this._element.style.display = 'block';
        this.show(animation);
        this.on_load(args);
    }
}

//var panel: Panel;
//panel.load = function (): JQueryPromise<any> {
//    return $.Deferred();
//}