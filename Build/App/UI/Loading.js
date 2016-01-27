//===============================================
// 说明：用来显现加载状态的窗口
define(["require", "exports", 'Application'], function (require, exports, app) {
    var $loadingForm = $('#loadingForm');
    function on_shown() {
        if (window['bootbox'])
            window['bootbox'].hideAll();
        $loadingForm.hide();
        $('#main').show();
    }
    app.pageCreated.add(function (sender, page) {
        page.showing.add(on_shown);
    });
    if (app.currentPage() != null) {
        app.currentPage().shown.add(on_shown);
        if (app.currentPage().visible()) {
            on_shown();
        }
    }
});
