module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
      js: {
        files: ['src/*.js'],
        tasks: ['jshint', 'webpack']
      },
      //test: {
      //  files: ['tests/*.js'],
      //  tasks: ['simplemocha']
      //}
    },

    //simplemocha: {
    //  options: {
    //    ui: 'bdd',
    //    reporter: 'spec'
    //  },
    //  all: {
    //    src: [
    //      'tests/setup.js',
    //      'tests/spec.js'
    //    ]
    //  }
    //},

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
          'backbone.marionette': 'Marionette',
          handlebars: 'Handlebars'
        }
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
        entry: './src/filtered-collection.js',
        output: {
          path: 'dist/',
          filename: 'filtered-collection.js',
          library: 'FilteredCollection'
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
  grunt.registerTask('dev', ['default', 'webpack', 'watch']);
}