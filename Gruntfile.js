module.exports = function (grunt) {
    // 项目配置
    var output_dir = 'Web/App/Core/';
    var app_dir = 'Web/App/';
    var script_dir = 'Web/Scripts/';
    var ui_dir = 'Web/App/UI/';
    var sv_dir = 'Web/App/Services/';
    var content_dir = 'Web/Content/';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: { separator: ';\r\n' },
            prequire: {
                src: ['prequireBegin.js', script_dir + 'ChiTu.js', app_dir + 'Application.js', app_dir + 'Site.js', script_dir + 'knockout.extentions/knockout.extentions.js',
                      ui_dir + 'Loading.js', sv_dir + 'Services.js', sv_dir + 'Member.js', sv_dir + 'ShoppingCart.js', app_dir + 'Rewrite.js',
                      ui_dir + 'Menu.js', app_dir + 'ErrorHandler.js', sv_dir + 'Shopping.js',
                      script_dir + 'modal.js', script_dir + 'bootbox.js', script_dir + 'bootbox.cn.js',
                      'prequireEnd.js'],
                dest: output_dir + 'prequire.js'
            },
            bootbox: {
                src: [script_dir + 'modal.js', script_dir + 'bootbox.js', script_dir + 'bootbox.cn.js'],
                dest: output_dir + 'bootbox.js'
            },
            css:{
                 src: [content_dir + 'css/font-awesome.css', content_dir + 'css/bootstrap.css', content_dir + 'Site.css', content_dir + 'swiper.css'],
                 dest: content_dir + 'css/all.css'
            }
        },
        uglify: {
            build: {
                files: (function () {
                    var result = {};
                    result[output_dir + 'prequire.min.js'] = output_dir + '/prequire.js';
                    return result;
                })()
            }
        },
        cssmin: {
            target: {
                files: {
                    'Web/Content/css/all.min.css': [content_dir + 'css/font-awesome.css', content_dir + 'css/bootstrap.css', content_dir + 'Site.css',
                                   content_dir + 'swiper.css']
                }
            }
        }
    });

    // 加载提供"uglify"任务的插件
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    // 默认任务
    grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);//
}

// module.exports = function (grunt) {
//     // 项目配置
//     grunt.initConfig({
//         pkg: grunt.file.readJSON('package.json'),
//         concat: {
//             //options: { separator: ';' },
//             dist: {
//                 src: ['Web/App/Application.js', 'Web/App/Site.js', 'Web/Scripts/knockout.extentions/knockout.extentions.js',
//                       'Web/App/UI/Loading.js', 'Web/App/UI/Menu.js', 'Web/App/Rewrite.js', 'Web/App/ErrorHandler.js'],
//                 dest: 'Build/prequire.js'
//             }
//         },
//         uglify: {
//             options: {
//                 banner: '/*! Author: Shu Mai, Contact: ansiboy@163.com */\n'
//             },
//             build: {
//                 src: 'Build/prequire.js',
//                 dest: 'Build/prequire.min.js'
//             }
//         }
//     });
//     // 加载提供"uglify"任务的插件
//     grunt.loadNpmTasks('grunt-contrib-concat');
//     grunt.loadNpmTasks('grunt-contrib-uglify');
//     // 默认任务
//     grunt.registerTask('default', ['concat', 'uglify']);
// }