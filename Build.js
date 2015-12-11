({
    baseUrl: 'Web/Scripts',
    name: '../App/Main',
    out: 'Web/App/Main.min.js',
    paths: {
        jquery: 'empty:',
        'jquery.cookie': 'empty:',
        'knockout':'empty:',
        'app/Site':'empty:',
        //'app/Application':'empty:',
        'ko.ext': 'empty:',
        'chitu': 'empty:',
        sv: '../App/Services',
        app: '../App',
        ui: '../App/UI'
    },
    optimize: 'none'
})