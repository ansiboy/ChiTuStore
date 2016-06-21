
var src_root = 'src';
var dest_root = 'www';

var www_ios = 'platforms/ios'
var www_android = 'platforms/android/assets'

var ts_options = {
    module: 'amd',
    target: 'es5',
    removeComments: true,
    sourceMap: false,
    references: [
        src_root + "/scripts/typings/*.d.ts",
        src_root + "/scripts/typings/*.ts"
    ]
};
module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            app: {
                src: [src_root + '/**/*.ts'],
                dest: dest_root ,
                options: ts_options
            }
        },
        copy: {
            main: {
                files: [
                    { expand: true, cwd: src_root, src: ['**/*.html'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['scripts/**/*.js'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['content/css/*.css'], dest: dest_root },
                    //{ expand: true, cwd: src_root, src: ['content/swiper.css'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['content/font/*.*'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['images/*.*'], dest: dest_root },
                    { expand: true, src: [src_root + '/*.html'], flatten: true, dest: dest_root },
                ],
                app_js: {
                    files: [{ expand: true, cwd: src_root, src: ['**/*.js'], dest: dest_root }]
                }
            },
            bootbox: {
                files: [{ expand: true, cwd: src_root, src: 'core/bootbox.js', dest: dest_root }]
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
                ]
            }
        },
        less: {
            app: {
                files: [{
                    expand: true,
                    cwd: src_root + '/content/App',
                    src: ['**/*.less'],
                    dest: dest_root + '/content/',
                    ext: '.css'
                }]
            },
            bootstrap: {
                files: [{
                    src: [src_root + '/content/bootstrap-3.3.5/bootstrap.less'],
                    dest: dest_root + '/content/css/bootstrap.css'
                }]
            },
            chitu: {
                files: [{
                    src: [src_root + '/content/chitu.less'],
                    dest: dest_root + '/content/chitu.css'
                }]
            }
        },
        // clean: {
        //     css: [src_root + '/Content/**/*.css'] // 清除编辑器自动生成的 CSS 文件
        // }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.registerTask('default', ['ts:app', 'copy', 'less']);
};