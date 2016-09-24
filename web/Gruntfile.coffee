#global module:false

"use strict"

module.exports = (grunt) ->
  grunt.loadNpmTasks "grunt-bower"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-exec"

  grunt.initConfig
    bower:
      dev:
        dest: '_site/lib/'
        js_dest: '_site/lib/js',
        css_dest: '_site/lib/css'
        options:
          packageSpecific:
            'jquery':
              stripGlobBase: true
              keepExpandedHierarchy: false
              files: ['dist/jquery.min.js']
            'three.js':
              files: ['three.min.js']
            'codemirror':
              stripGlobBase: true
              keepExpandedHierarchy: false
              files: [
                'lib/codemirror.js'
                'lib/codemirror.css'
                'theme/monokai.css'
                'addon/selection/active-line.js'
                'addon/edit/matchbrackets.js'
                'addon/hint/show-hint.js'
                'addon/hint/show-hint.css'
              ]

    exec:
      bower:
        cmd: 'bower install'

    copy:
      webapp:
        files: [{
          expand: true
          src: "index.html"
          dest: "_site/"
        },
        {
          expand: true
          src: "lammps.js.mem"
          dest: "_site/"
        },
        {
          expand: true
          src: "css/*"
          dest: "_site/"
        },
        {
          expand: true
          src: "js/**"
          dest: "_site/"
        }]

    watch:
      options:
        livereload: true
      source:
        files: [
          "css/**/*"
          "js/**/*"
          "*.html"
        ]
        tasks: [
          "build"
        ]

    connect:
      server:
        options:
          port: 8080
          base: '_site'
          livereload: true

  grunt.registerTask "build", [
    "exec:bower"
    "bower:dev"
    "copy"
  ]

  grunt.registerTask "serve", [
    "build"
    "connect:server"
    "watch"
  ]

  grunt.registerTask "default", [
    "serve"
  ]
