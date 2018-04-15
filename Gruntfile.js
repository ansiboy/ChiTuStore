
var src_root = 'src';
var dest_root = 'www';

var www_browser = 'platforms/browser';
var www_ios = 'platforms/ios'
var www_android = 'platforms/android/assets'

var ts_options = {
    module: 'amd',
    target: 'es5',
    removeComments: true,
    sourceMap: false,
    references: [
        src_root + "/Scripts/typings/*.d.ts",
        src_root + "/Scripts/typings/*.ts"
    ]
};
module.exports = function (grunt) {
    grunt.initConfig({
        // ts: {
        //     app: {
        //         src: [src_root + '/**/*.ts'],
        //         dest: dest_root,
        //         options: ts_options
        //     }
        // },
        shell: {
            client: {
                command: 'tsc -p ./src',
                options: {
                    failOnError: false
                }
            }
        },
        // 通过connect任务，创建一个静态服务器
        connect: {
            www: {
                options: {
                    // 服务器端口号
                    port: 2252,
                    // 服务器地址(可以使用主机名localhost，也能使用IP)
                    // hostname: '192.168.1.9',
                    hostname: '127.0.0.1',
                    // keepalive: true,
                    livereload: 26279,
                    // 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
                    base: 'www',
                    open: true,
                    // protocol: 'https',
                }
            }
        },
        copy: {
            main: {
                files: [
                    { expand: true, cwd: src_root, src: ['**/*.html'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['scripts/**/*.js'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['content/css/*.css'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['content/swiper.css'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['content/font/*.*'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['images/**/*.*'], dest: dest_root },
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
        watch: {
            livereload: {
                options: {
                    livereload: 26279 //监听前面声明的端口  35729
                },
                files: [
                    `www/**/*`
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['shell', 'copy', 'less']);
};