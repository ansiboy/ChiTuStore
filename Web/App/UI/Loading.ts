//===============================================
// 说明：用来显现加载状态的窗口

import app = require('Application');

var $loadingForm = $('#loadingForm');

function on_shown() {
    if (window['bootbox'])
        window['bootbox'].hideAll();

    $loadingForm.hide();
    $('#main').show();
}

app.pageCreated.add(function(sender, page) {
    /// <param name="page" type="chitu.Page"/>
    page.showing.add(on_shown);
});

if (app.currentPage() != null) {
    app.currentPage().shown.add(on_shown);
    if (app.currentPage().visible() == true) {
        on_shown();
    }
}





