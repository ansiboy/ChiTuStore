(function (factory) {
    var references = ['knockout'];
    if (typeof define === 'function' && define.amd) {
        define(references, factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require(references));
    } else {
        window.chitu = factory(ko);
    }
})(function () {

});