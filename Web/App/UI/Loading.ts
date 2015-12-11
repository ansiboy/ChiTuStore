//===============================================
// 说明：用来显现加载状态的窗口

//var $loadingForm = $('<div>').insertAfter($('#main'));
//$loadingForm.html('<div id="loadingForm" class="text-center" style="padding-top:100px;">  <i class="icon-spinner icon-3x icon-spin"></i><h5>加载中...</h5></div>')

import app = require('Application');

var $loadingForm = $('#loadingForm');

function on_shown() {
    if (window['bootbox'])
        window['bootbox'].hideAll();

    $loadingForm.hide();
    $('#main').show();
}

app.pageCreated.add(function (sender, page) {
    /// <param name="page" type="chitu.Page"/>
    page.showing.add(on_shown);
});

if (app.currentPage() != null) {
    app.currentPage().shown.add(on_shown);
    if (app.currentPage().visible()) {
        on_shown();
    }
}





