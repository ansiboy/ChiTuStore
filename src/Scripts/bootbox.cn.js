(function (factory) {
    if (typeof define === 'function' && define.amd)
        define(['bootbox'], factory);
    else
        factory(window['bootbox']);

})(function (bootbox) {
    bootbox.setDefaults({ locale: 'zh_CN' });
    window['bootbox'] = bootbox;
   
    return bootbox;
});