
import site = require('Site');
import app = require('Application');

var plus = window['plus'];
var navigator: any = plus.navigator;
if (site.env.isIOS) {
	navigator.setStatusBarStyle('UIStatusBarStyleBlackOpaque');
	navigator.setStatusBarBackground('#bf0705');
} else {
	navigator.setStatusBarStyle('#bf0705');
	navigator.setStatusBarBackground('#bf0705');
}

var want_to_close = false;
plus.key.addEventListener("backbutton", function() {
	app.back()
		.fail(() => {
			console.log('back fail');
			if (want_to_close) {
				plus.runtime.quit();
				return;
			}
			want_to_close = true;
			plus.nativeUI.toast('再按一次返回退出');
		})
		.done(() => {
			console.log('back success');
			want_to_close = false;
		});
});


//var _hashchange = app.hashchange;
//app.hashchange = $.proxy(function() {
//	var currentWebView= plus.webview.currentWebview();
//	console.log(currentWebView.id);
//	_hashchange.apply(app);
//}, app);