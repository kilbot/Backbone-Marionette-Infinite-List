module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
      js: {
        files: ['src/*.js'],
        tasks: ['jshint', 'webpack']
      },
      test: {
       files: ['test/*.js', 'src/*.js'],
       tasks: ['simplemocha']
      }
    },

    simplemocha: {
     options: {
       ui: 'bdd',
       reporter: 'spec'
     },
     all: {
       src: [
         'test/setup.js',
         'test/spec.js'
       ]
     }
    },

    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish'),
        verbose: true
      },
      files: ['src/*.js']
    },

    webpack: {
      options: {
        entry: {
          app: './index.js'
        },
        resolve: {
          alias: {
            marionette: 'backbone.marionette',
            'backbone.wreqr': 'backbone.radio',
            radio: 'backbone.radio',
            underscore: 'lodash'
          },
          modulesDirectories: ['node_modules']
        },
        externals: {
          jquery: 'jQuery',
          lodash: '_',
          underscore: '_',
          backbone: 'Backbone',
          'backbone.marionette': 'Marionette'
        },
        cache: true,
        watch: true
      },
      build: {
        output: {
          path: './dist',
          filename: '[name].js',
          library: 'app'
        }
      }
    }

  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('dev', ['default', 'webpack', 'simplemocha', 'watch']);
}