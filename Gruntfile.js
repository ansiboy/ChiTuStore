
var src_root = 'src';
var dest_root = 'www';

var www_browser = 'platforms/browser';
var www_ios = 'platforms/ios'
var www_android = 'platforms/android/assets'

var ts_options = {
    module: 'amd',
    target: 'es5',
    removeComments: true,
    references: [
        src_root + "/Scripts/typings/*.d.ts",
        src_root + "/Scripts/typings/*.ts"
    ]
};
module.exports = function(grunt) {
    grunt.initConfig({
        ts: {
            app: {
                src: [src_root + '/App/**/*.ts'],
                dest: dest_root + '/App',
                options: ts_options
            }
        },
        copy: {
            main: {
                files: [
                    { expand: true, cwd: src_root, src: ['App/**/*.html'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['Scripts/**/*.js'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['Content/css/*.css'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['Content/swiper.css'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['Content/font/*.*'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['Images/**/*.*'], dest: dest_root },
                    { expand: true, src: [src_root + '/*.html'], flatten: true, dest: dest_root },
                ],
                app_js: {
                    files: [{ expand: true, cwd: src_root, src: ['App/**/*.js'], dest: dest_root }]
                }
            },
            bootbox: {
                files: [{ expand: true, cwd: src_root, src: 'App/Core/bootbox.js', dest: dest_root }]
            },
            www: {
                files: [{
                    expand: true,
                    src: dest_root + '/**/*.*',
                    dest: www_ios,
                },
                    {
                        expand: true,
                        src: dest_root + '/**/*.*',
                        dest: www_android,
                    },
                    {
                        expand: true,
                        src: dest_root + '/**/*.*',
                        dest: www_browser,
                    },
                ]
            }
        },
        less: {
            app: {
                files: [{
                    expand: true,
                    cwd: src_root + '/Content/App',
                    src: ['**/*.less'],
                    dest: dest_root + '/Content/',
                    ext: '.css'
                }]
            },
            bootstrap: {
                files: [{
                    src: [src_root + '/Content/bootstrap-3.3.5/bootstrap.less'],
                    dest: dest_root + '/Content/css/bootstrap.css'
                }]
            },
            chitu: {
                files: [{
                    src: [src_root + '/Content/chitu.less'],
                    dest: dest_root + '/Content/chitu.css'
                }]
            }
        },
        clean: {
            css: [src_root + '/Content/**/*.css'] // 清除编辑器自动生成的 CSS 文件
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.registerTask('default', ['ts:app', 'copy', 'less', 'clean']);
};