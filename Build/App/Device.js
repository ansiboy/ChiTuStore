define(["require", "exports", 'Site', 'Application'], function (require, exports, site, app) {
    var plus = window['plus'];
    var navigator = plus.navigator;
    if (site.env.isIOS) {
        navigator.setStatusBarStyle('UIStatusBarStyleBlackOpaque');
        navigator.setStatusBarBackground('#bf0705');
    }
    else {
        navigator.setStatusBarStyle('#bf0705');
        navigator.setStatusBarBackground('#bf0705');
    }
    var want_to_close = false;
    plus.key.addEventListener("backbutton", function () {
        app.back()
            .fail(function () {
            console.log('back fail');
            if (want_to_close) {
                plus.runtime.quit();
                return;
            }
            want_to_close = true;
            plus.nativeUI.toast('再按一次返回退出');
        })
            .done(function () {
            console.log('back success');
            want_to_close = false;
        });
    });
});
