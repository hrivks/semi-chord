module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	concat: {
		options: {
			separator: ';',
		},
		dist: {
			src: ['src/semi-chord._SC.js',
					'src/semi-chord.validation.js',
					'src/semi-chord.utils.js',
					'src/semi-chord.computation.js',
					'src/semi-chord.drawing.js',
					'src/semi-chord.interactions.js',
					'src/semi-chord.highlighting.js',
					'src/semi-chord.export.js',
					'src/semi-chord.js'],
			dest: 'compile/semi-chord.compiled.js',
		},
	},
	uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> | ' 
			+'<%= grunt.template.today("yyyy-mm-dd") %>\n'
			+' * <%= pkg.author %> | <%= pkg.license %> License | <%= pkg.homepage %> */'
      },
      build: {
        src: 'compile/semi-chord.compiled.js',
        dest: '<%= pkg.name %>.min.js'
      }
    },
	jsdoc : {
        dist : {
            src: ['src/*.js'],
            options: {
                destination: 'doc'
            }
        }
    }, 
	'string-replace': {
		dist: {
			files: {
			  './': '<%= pkg.name %>.min.js',
			  'doc/': 'doc/*.html'
			},
			options: {
			  replacements: [{
				pattern:  /{{VERSION}}/g,
				replacement: '<%= pkg.version %>'
			  }]
			}
		}
	}
  });

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', /* 'jsdoc' , */ 'string-replace']);

};