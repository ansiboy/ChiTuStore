
/// <reference path="jquery.d.ts"/>

declare module 'text!Module/Home/ProductList/ProductsFilter.html' {
}





declare module "jweixin" {
    function config(value);
    function ready(callback: Function)
    function error(callback: Function)
    function onMenuShareTimeline(value)
    function onMenuShareAppMessage(value)
}

declare module 'md5' {
    interface WordArray {
        toString(): string
    }
    function MD5(value: string): WordArray;
}



interface LoadListPromise<T> extends JQueryPromise<Array<T>> {
    loadCompleted: boolean
}

//declare module "sc/Home/Index" { }