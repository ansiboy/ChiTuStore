(function (factory) {
    var references = ['chitu']
    if (typeof define === 'function' && define.amd) {
        define(references, factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require(references));
    } else {
        factory();
    }
})(function () {
    //chitu.scrollTop = function (page) {
    //    /// <param name="page" type="chitu.Page"/>
    //    $.extend(page, {
    //        _keyChanged: false,
    //        key: function (value) {
    //            if (value === undefined)
    //                return this._key;

    //            if (this._key != value) {
    //                this._key = value;
    //                this._keyChanged = true;
    //            }
    //            else {
    //                this._keyChanged = false;
    //            }
    //        },
    //        _on_shown: page.on_shown,
    //        on_shown: function (args) {
    //            var result = this._on_shown(args);

    //            if (this.key() == null || this._keyChanged) {
    //                this.node().scrollTop = '0px';
    //            }

    //            return result;
    //        }
    //    });

    //    return chitu;
    //}
});
