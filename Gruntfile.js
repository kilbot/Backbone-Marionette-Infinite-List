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
        module: {
          loaders: [
            { test: /\.hbs$/, loader: 'raw-loader' }
          ]
        },
        resolve: {
          alias: {
            marionette: 'backbone.marionette',
            underscore: 'lodash'
          },
        },
        externals: {
          jquery: 'jQuery',
          lodash: '_',
          underscore: '_',
          backbone: 'Backbone',
          'backbone.marionette': 'Marionette',
          handlebars: 'Handlebars'
        },
        watch: true
      },
      view: {
        entry: './src/infinite-list-view.js',
        output: {
          path: 'dist/',
          filename: 'infinite-list-view.js',
          library: 'InfiniteListView'
        }
      },
      filtered: {
        entry: './src/filter-behavior.js',
        output: {
          path: 'dist/',
          filename: 'filter-behavior.js',
          library: 'FilterBehavior'
        }
      },
      dual: {
        entry: './src/dual-collection.js',
        output: {
          path: 'dist/',
          filename: 'dual-collection.js',
          library: 'DualCollection'
        }
      }
    }

  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('dev', ['default', 'webpack', 'simplemocha', 'watch']);
}