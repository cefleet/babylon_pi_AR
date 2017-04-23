module.exports = function(grunt) {

    // 1. All configuration goes here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
    		dist: {
        		src: [
        			'JS/main.js',
        			'JS/Game.js',
            		'JS/JSClasses/*.js', // All JS in the libs folder
        		],
        		dest: 'JS/game.js',
    		}
		},
		uglify: {
    		build: {
        		src: 'JS/game.js',
        		dest: 'static/game.min.js'
    		}
		},
		watch: {
  			scripts: {
    			files: ['JS/Game.js','JS/main.js','JS/JSClasses/*.js'],
    			tasks: ['concat','uglify'],
    			options: {
      				spawn: false,
    			}
  			}
		}
    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['concat','uglify']);
    //grunt.registerTask('watch', ['watch']);

};
