/*
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
*/
var dest_root = 'Build';
var js_files = [''];
var ts_options = {
    module: 'amd',
    target: 'es5',
    removeComments: true,
    references: [
        "Web/Scripts/typings/*.d.ts",
        "Web/Scripts/typings/*.ts"
    ]
};
module.exports = function (grunt) {
    grunt.initConfig({
        typescript: {
            base: {
                src: ['Web/App/**/*.ts'],
                dest: 'Build',
                options: ts_options
            },
            root_files: {
                src: ['Web/App/*.ts'],
                dest: 'Build',
                options: ts_options
            }
        },
        copy: {
            main: {
                files: [
                    { expand: true, cwd: 'Web/', src: ['App/**/*.html'], dest: 'Build' },
                    { expand: true, src: ['Web/*.html'], flatten: true, dest: 'Build' },
                    { expand: true, cwd: 'Web/', src: ['Scripts/**/*.js'], dest: 'Build' },
                    { expand: true, cwd: 'Web/', src: ['Content/css/*.css'], dest: 'Build' },
                    { expand: true, cwd: 'Web/', src: ['Content/swiper.css'], dest: 'Build' },
                    { expand: true, cwd: 'Web/', src: ['Content/font/*.*'], dest: 'Build' },
                    { expand: true, cwd: 'Web/', src: ['Images/**/*.*'], dest: 'Build' },
                ]
            },
            bootbox: {
                files: [{ expand: true, cwd: 'Web', src: 'App/Core/bootbox.min.js', dest: 'Build' }]
            }
        },
        less: {
            app: {
                files: [{
                    expand: true,
                    cwd: 'Web/Content/App',
                    src: ['**/*.less'],
                    dest: 'Build/Content/',
                    ext: '.css'
                }]
            },
            bootstrap: {
                files: [{
                    src: ['Web/Content/bootstrap-3.3.5/bootstrap.less'],
                    dest: dest_root + '/Content/css/bootstrap.css'
                }]
            },
            chitu:{
                files: [{
                    src: ['Web/Content/chitu.less'],
                    dest: dest_root + '/Content/chitu.css'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('default', ['typescript', 'copy', 'less']);

};