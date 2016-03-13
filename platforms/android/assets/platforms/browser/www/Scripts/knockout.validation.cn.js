/************************************************
* This is an example localization page. All of these
* messages are the default messages for ko.validation
* 
* Currently ko.validation only does a single parameter replacement
* on your message (indicated by the {0}).
*
* The parameter that you provide in your validation extender
* is what is passed to your message to do the {0} replacement.
*
* eg: myProperty.extend({ minLength: 5 });
* ... will provide a message of "Please enter at least 5 characters"
* when validated
*
* This message replacement obviously only works with primitives
* such as numbers and strings. We do not stringify complex objects 
* or anything like that currently.
*/

ko.validation.localize({
    required: '该项为必填项。',
    min: '请输入一个值大于或等于 {0}。',
    max: '请输入一个值小于或等于 {0}。',
    minLength: '请输入至少 {0} 字符。',
    maxLength: '请输入不超过 {0} 字符。',
    pattern: '请检查该值。',
    step: '该值必须增长 {0}',
    email: '请输入正确的邮箱地址',
    date: '请输入正确的日期',
    dateISO: '请输入正确的日期',
    number: '请输入一个数',
    digit: '请输入一个数字',
    phoneUS: '请输入正确的电话号码',
    equal: '数值必须相等',
    notEqual: '请选择另外一个值',
    unique: '请确定该数值为唯一的'
});


