//import site = require('Site');
chitu['scroll'] = function (page) {
    page['scrollTop'] = $.proxy(function (value) {
        if (value === void 0) { value = undefined; }
        if (value === undefined)
            return this.node().scrollTop;
        this.node().scrollTop = value;
    }, page);
    //========================================================
    // 实现滚动
    var wrapper_node = page.nodes().bodyNode;
    wrapper_node.style.position = 'fixed';
    wrapper_node.style.height = $(window).height() + 'px';
    wrapper_node.style.width = '100%';
    wrapper_node.style.overflowY = 'auto';
    wrapper_node.style.overflowX = 'hidden';
    $(window).on('resize', function () {
        wrapper_node.style.height = $(window).height() + 'px';
    });
    wrapper_node.onscroll = function () {
        var args = {
            scrollTop: wrapper_node.scrollTop,
            scrollHeight: wrapper_node.scrollHeight,
            clientHeight: wrapper_node.clientHeight
        };
        page.on_scroll(args);
    };
    //========================================================
    //function page_shown(sender: chitu.Page) {
    //    if(site.menu
    //}
};
//# sourceMappingURL=file1.js.map