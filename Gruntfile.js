
var dest_root = 'Build';
var src_root = 'Web';
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
                    { expand: true, cwd: src_root, src: ['App/**/*.html'], dest: dest_root },
                    { expand: true, src: ['Web/*.html'], flatten: true, dest: dest_root },
                    { expand: true, cwd: src_root, src: ['Scripts/**/*.js'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['Content/css/*.css'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['Content/swiper.css'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['Content/font/*.*'], dest: dest_root },
                    { expand: true, cwd: src_root, src: ['Images/**/*.*'], dest: dest_root },
                ],
                app_js: {
                    files: [{ expand: true, cwd: src_root, src: ['App/**/*.js'], dest: dest_root }]
                }
            },
            bootbox: {
                files: [{ expand: true, cwd: src_root, src: 'App/Core/bootbox.min.js', dest: dest_root }]
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
            chitu: {
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