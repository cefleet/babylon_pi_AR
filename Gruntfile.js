module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {   
    		dist: {
        		src: [
            		'JSClasses/*.js', // All JS in the libs folder
        		],
        		dest: 'game.js',
    		}
		},
		uglify: {
    		build: {
        		src: 'game.js',
        		dest: 'static/game.min.js'
    		}
		}

    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['concat','uglify']);

};