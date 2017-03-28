// Authors: Michelle Co, Brian Baker
// This game challenges users with logic statements that need to be evaluated, for every correct answer a rocketship moves closer to the moon, and for every inccorect answer the ship loses a large amount of fuel

$(document).ready(function() {
    // console.log("YAY!")
    // ==========================
    // =      Game Config       =
    // ==========================

    var gameConfig = {
        // Various game difficultyLevels and thier settings
        difficultyLevels: [
            {
                difficulty: 0,
                questions: 15
            }, 
            {
                difficulty: 1, 
                questions: 21
            }, 
            {
                difficulty: 2, 
                questions: 30
            }
        ],


        // The time limit until fuel runs out
        missionTime: 120,

        // Fuel Penalty (8%)
        penalty: 0.08,

        // An array of astronaut names
        astronauts: [
            'Ryan', 
            'Simon', 
            'Sylvia', 
            'Tiffany'
        ],

        // Values to be used for comparison in logic statements
        statementValues: [
            50, 
            100, 
            150, 
            200, 
            250, 
            300
        ],

        // Logic operators to be used to combine logic statements
        logicOperators: [
            "||", 
            "&&"
        ],

        // Comparison operators to be used to compare values in logic statements
        comparisonOperators: [
            "<", 
            ">", 
            "===", 
            "<=", 
            ">="
        ]
    }


    // ==========================
    // =      Game Object       =
    // ==========================

    // All HTML Elements are defined here
   
    //User difficulty input
    var $difficultySetting = $('#difficulty');

    // Fullscreen menus
    var $fullscreenMenuWrapper = $('.fullscreenMenuWrapper');
    var $launcherWrapper = $('.launcherWrapper');
    var $victoryWrapper = $('.victoryWrapper');
    var $failureWrapper = $('.failureWrapper');

    // Game controls menus
    var $controlsWrapper = $('.controlsWrapper');
    var $question = $('.question');
    var $clock = $('.clock');

    // Progress indicator
    var $correctQuestions = $('.correctQuestions');
    var $questionsNeeded = $('.questionsNeeded');
    
    // Fuel guage
    var $fuel = $('.fuel');
    var $fuelGauge = $('.fuelGaugeFillerCover');
    var $fuelGaugeReserve = $('.fuelGaugeFillerReserve');

    // Space window wrapper
    var $spaceWrapper = $('.spaceWrapper');
    
    // SVGs
    var $rocket = $('.rocket');
    var $flameOne = $('#flameOne');
    var $flameTwo = $('#flameTwo');
    var $moon = $('.moon');
    var $ground = $('.grass');


    // -------------------------
    // -    Countdown Timer    -
    // -------------------------

    var countDownTimer = {
        // The object that will hold the timer
        timer: {},
        
        // The inital start time, should never be manipulated
        startTime: gameConfig.missionTime,
        
        // The current time
        currentTime: gameConfig.missionTime,
        
        // The interval between the timer tics
        interval: 1000,
        
        // Takes a number and returns a string formated with a leading zero
        formatTime: function(number) {
            var leadingZero = '';
            if(String(number).length === 1) {
                leadingZero = '0';
            }
            return `${leadingZero}${number}`;
        },

        // Updates the timer html element with current time
        updateClockElement: function() {
            var minutes = this.formatTime(Math.floor((this.currentTime / 60)));
            var seconds = this.formatTime(Math.floor(this.currentTime % 60));

            $clock.html(`${minutes}:${seconds}`);
        },

        // This function runs every time the time counts down
        countDown: function() {

            // Check if the timer has reached zero, if it has reset the timer and skip the current question 
            if(this.currentTime < 0) {
                this.pause();
            }
            else {
                            // Update HTML Element with new time
                this.updateClockElement();

                // Count down
                this.currentTime--;
            }

        },

        // Penalty for answering incorrectly
        spendTime: function() {
            this.currentTime = this.currentTime - (this.startTime * gameConfig.penalty);
        },

        // Intitializes the timer object
        initialize: function() {
            this.timer = window.setInterval(function() { countDownTimer.countDown() }, this.interval);
        },

        // Resumes the timer
        resume: function() {
            this.initialize();
        },

        // Pauses the timer
        pause: function() {
            window.clearInterval(this.timer);
        },

        // Resets the timer using the default value from the config
        restart: function() {

            // Reset current time
            this.currentTime = this.startTime;
            this.pause();
            
            // Update HTML Element with new Time
            this.updateClockElement();
        }
    };


    var fuelTimer = {
        // The object that will hold the timer
        timer: {},
        
        // The inital start time, should never be manipulated
        targetTime: (gameConfig.missionTime * 10),

        currentTime: 0,
        
        // The interval between the timer tics
        interval: 100,
        
        // Updates the timer html element with current time
        updateClockElement: function() {
            game.updateFuel();
        },

        // This function runs every time the time counts down
        countDown: function() {
            // Check if the timer has reached zero, if it has reset the timer and skip the current question 
            if(this.currentTime >= this.targetTime) {
                this.pause();
                game.checkGameStatus();
            }

            // Update HTML Element with new time
            this.updateClockElement();


            // Increase currentTime, used to increase the width of the guage cover element
            this.currentTime++;

        },

        // Returns the current fuel level as a percentage
        getFuelLevel: function() {
            return (this.currentTime / this.targetTime) * 100
        },

        // Penalty for answering incorrectly
        spendFuel: function() {
                this.currentTime = this.currentTime + (this.targetTime * gameConfig.penalty);  
        },

        // Intitializes the timer object
        initialize: function() {
            this.timer = window.setInterval(function() { fuelTimer.countDown() }, this.interval);
        },

        // Resumes the timer
        resume: function() {
            this.initialize();
        },

        // Pauses the timer
        pause: function() {
            window.clearInterval(this.timer);
        },

        // Resets the timer using the default value from the config
        restart: function() {

            // Reset current time
            this.currentTime = 0;
            this.pause();
            
            // Update HTML Element with new Time
            this.updateClockElement();
        }
    };

    // -------------------------
    // -       Setup Game      -
    // -------------------------
    // console.log('[NEW GAME]');
    var game = {
        // Gameplay settings, these values will be set when this object's initialization is called

        // Selected difficulty level
        difficulty: 0,

        // Current fuel
        currentFuel: 0,

        // Total number of questions
        numberOfQuestions: 0,

        // Total number of correct answers needed
        neededAnswers: 0,

        // The current question
        currentQuestion: 0,
        
        // Number of correct answers
        correctAnswers: 0,

        // An array of questions
        questions: [],

        // The position of the space background image
        spacePosition: 0,

        // A bool to determine if the Rocket ship has launched
        rocketLuanched: false,

        // Initialzes all game properties with values default vaules from gameConfig and set manually 
        initialize: function() {
            // Reset all properties
            this.difficulty = game.difficulty;
            this.currentFuel = this.getCurrentProgress();
            this.numberOfQuestions = gameConfig.difficultyLevels[game.difficulty].questions;
            this.neededAnswers = this.numberOfQuestions - (this.numberOfQuestions / 3);
            this.currentQuestion = 0;
            this.correctAnswers = 0;
            this.questions = [];
            this.spacePosition = this.getCurrentProgress();
            this.rocketLuanched = false

            // Reset all html elements
            $fullscreenMenuWrapper.removeClass('menuHide');
            $fullscreenMenuWrapper.removeClass('victory');
            $launcherWrapper.removeClass('menuHide');
            $controlsWrapper.removeClass('moonLanding');
            $spaceWrapper.removeClass('moonLanding');
            $victoryWrapper.addClass('menuHide');
            $failureWrapper.addClass('menuHide');
            $rocket.removeClass('moonLanding');
            $rocket.removeClass('space');
            $flameOne.addClass('flamesOff');
            $flameTwo.addClass('flamesOff');
            $ground.removeClass('hide');
            $moon.addClass('hide');

            // Generate new set of questions
            this.generateQuestions(game.numberOfQuestions);

            // Reset the position of the Rocket ship
            this.updateSpacePosition();

            // Update All HTML menu elements
            this.updateHTML();
        },

        // Starts the Game
        start: function() {
            this.initialize();
            this.launchRocket();
            fuelTimer.initialize();
            countDownTimer.initialize();
        }, 

        // Re-intializes all game values and timers
        restart: function() {
            this.initialize();
            fuelTimer.restart();
            countDownTimer.restart();
        },

        // Check weather the mission has succeded or failed, and triggers the approprate animations and changes
        checkGameStatus: function() {
            if(this.getCurrentProgress() <= 0) {
                fuelTimer.pause();
                countDownTimer.pause();
                $moon.removeClass('hide');
                $flameOne.addClass('flamesOff');
                $flameTwo.addClass('flamesOff');
                $controlsWrapper.addClass('moonLanding');
                $rocket.addClass('moonLanding');
                $fullscreenMenuWrapper.removeClass('menuHide');
                $fullscreenMenuWrapper.addClass('victory');
                $victoryWrapper.removeClass('menuHide');
                $spaceWrapper.addClass('moonLanding');
            }
            else if(Math.round(fuelTimer.getFuelLevel()) >= 100) {
                fuelTimer.pause();
                countDownTimer.pause();
                $fullscreenMenuWrapper.removeClass('menuHide');
                $failureWrapper.removeClass('menuHide');
            }
        },

        // Returns the current progress as a percentage
        getCurrentProgress: function() {
            var progress = Math.floor(
                ((this.neededAnswers - this.correctAnswers) / this.neededAnswers) * 100
            );

            if(progress >= 0){
                return progress;
            }
        },

        // Check if the question is correct or incorrect, then changes to the next question
        nextQuestion: function(correctAnswer = false) {
            // Checks to see if the current question is NOT the last one in the array

            // if(this.currentQuestion < this.questions.length - 1 && this.errors < gameConfig.difficultyLevels[this.difficulty].maxErrors) {
            if(this.correctAnswers < this.neededAnswers) {
                // Increment to next question
                this.currentQuestion += 1;
                
                // If the answer was correct consume fuel
                if(correctAnswer) {
                    this.correctAnswers++;
                }
                else {
                    if(fuelTimer.getFuelLevel() < 100) {
                        fuelTimer.spendFuel();
                        countDownTimer.spendTime();
                    }
                }
            }

            this.checkGameStatus();

            this.updateHTML();
            

        },

        // Generates an array of questions based on the selected game difficulty
        generateQuestions: function(numberOfQuestions) {
            var stepSize = (numberOfQuestions / 3)

            // Divides the number of questions into three stages, and generates questions with difficulty settings for that stage. Stage three gets and additions set of questions
            for(var difficultyStep = stepSize; difficultyStep <= numberOfQuestions; difficultyStep = difficultyStep + stepSize) {
                var questionDifficulty = (difficultyStep / stepSize) - 1;
                for(var i = 0; i < stepSize; i++) {
                    this.questions.push(this.generateQuestion(questionDifficulty));
                }
                if(questionDifficulty === 2) {
                    for(var i = 0; i < stepSize; i++) {
                        this.questions.push(this.generateQuestion(questionDifficulty));
                    }
                }
                
            }
        },

        // Returns a randomly generated question with a numeric difficulty parameter (1-3)
        generateQuestion: function(questionDifficulty) {
            var statementValues = [];
            var comparisionOperators = [];
            var logicOperators = [];
            var question = '';
            var answer = '';

            var numberOfValues = (1 + questionDifficulty) * 2;
            var numberOfComparisonOperators = (questionDifficulty);
            var numberOfLogicOperators = (questionDifficulty - 1);

            var valueA = 0;
            var valueB = 1;
            var valueIncrement = 2;

            // Get a random values from an array that will be used for comparison in the in logic statement
            for(var i = 0; i < numberOfValues; i++) {
                statementValues.push(getRandomFromArray(gameConfig.statementValues));
            }

            // Get a random comparison operators from an array that will be used for comparison in the in logic statement
            for(var i = 0; i <= numberOfComparisonOperators; i++) {
                comparisionOperators.push(getRandomFromArray(gameConfig.comparisonOperators));
            }

            // Get a random logic operators from an array, that will be used for comparison in the in logic statement
            for(var i = 0; i <= numberOfLogicOperators; i++) {
                logicOperators.push(getRandomFromArray(gameConfig.logicOperators));
            }

            for(var i = 0; i <= questionDifficulty; i++) {
                
                var logicOperator = '';
                var logicOperatorOffsetIndex = i;

                if(logicOperators[logicOperatorOffsetIndex] !== undefined) {
                    logicOperator = logicOperators[logicOperatorOffsetIndex]
                }

                statement = `${statementValues[valueA]} ${comparisionOperators[i]} ${statementValues[valueB]} ${logicOperator}`;
                question = 
                    question + 
                    `<span class="value">${statementValues[valueA]}</span> <span class="comparisonOperator">${comparisionOperators[i]}</span> <span class="value">${statementValues[valueB]}</span> <span class="logicOperator">${logicOperator}</span> `;                
                
                valueA = valueA + valueIncrement;
                valueB = valueB + valueIncrement;
                
            }

            answer = eval(statement);

            // Returns an object with the question, it's answer and it's difficulty
            return {question, answer, questionDifficulty};
        },

        // Launches the rocket
        launchRocket: function() {
            if(!this.rocketLuanched) {
                this.rocketLuanched = true;
                $flameOne.removeClass('flamesOff');
                $flameTwo.removeClass('flamesOff');
                $rocket.addClass('space');
                $ground.addClass('hide');
                $fullscreenMenuWrapper.addClass('menuHide');
                $launcherWrapper.addClass('menuHide');
            }
        },
        
        // Moves the space backbround based on the progress percentage
        updateSpacePosition: function() {        
            // Check to see if the end had been reached
            if(this.spacePosition > 0) {
                // Update New Space Position
                this.spacePosition = this.getCurrentProgress();
                // Update the HTML elements
                this.updateHTML();
            }
        },

        // Updates current fuel level with new percentage value based on the current question vs total questions
        updateFuel: function() {
            this.currentFuel = fuelTimer.getFuelLevel();
            $fuelGauge.css('width', `${this.currentFuel}%`);
        },

        // Updates the progress indicator Element
        updateProgressIndicator: function() {
            $correctQuestions.html(this.correctAnswers);
            $questionsNeeded.html(this.neededAnswers);
        },

        // Adds css class to the question as the question gets longer
        updateQuestionClass: function() {
            if(this.questions[this.currentQuestion].questionDifficulty === 1) {
                $question.addClass('mediumQuestion');
            }
            else if(this.questions[this.currentQuestion].questionDifficulty >= 2) {
                $question.addClass('largeQuestion');
            }

            $question.html(this.questions[this.currentQuestion].question);
        },

        // Updates the background position of the space wrapper
        updateSpaceWrapper: function() {
            $spaceWrapper.css('background-position', `center ${this.spacePosition}%`);
        },

        // Updates all menu HTML elemnts
        updateHTML: function() {
            this.updateProgressIndicator();
            this.updateFuel();
            this.updateQuestionClass();
            this.updateSpaceWrapper();
            
        },
    }

    // Returns a random value from the given array
    function getRandomFromArray(array) {
        var randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }

    // Initialzes the game, but doesn't start it
    game.initialize();


    // ==========================
    // =     Event Handers      =
    // ==========================

    // Hander for the Answer Buttons
    $('button.answer').on('click', function() {

        // The button that was clicked
        var buttonClicked = $(this);

        // The value of the button clicked matches the value of the question's answer
        if(eval(buttonClicked.val()) === game.questions[game.currentQuestion].answer) {
            // Flashes the question text green
            $question.addClass('correct');
            
            // Wait for flash to end
            $question.on("webkitAnimationEnd oAnimationEnd msAnimationEnd animationend", function(e) {
                
                // When any animation on this element ends this code block runs
                if(e.originalEvent.animationName === 'flashCorrect') {
                    
                    // Removes animation
                    $question.removeClass('correct');
                    
                    // Moves the ship
                    game.updateSpacePosition();
                }
            });

            // Move onto the next question, passing that the question was answered correctly
            game.nextQuestion(true);
        }
        else {

            // Flashes the question text red
            $question.addClass('incorrect');
            
            // Wait for flash to end
            $question.on("webkitAnimationEnd oAnimationEnd msAnimationEnd animationend", function(e) {

                // When any animation on this element ends this code block runs
                if(e.originalEvent.animationName === 'flashIncorrect') {
                    $question.removeClass('incorrect');
                }

            });

            // Move onto the next question, passing that the question was answered correctly
            game.nextQuestion(false);
        }
    });


    // Event handlers for all other menu buttons
    $('button').on('click', function() {

        // The button that was clicked
        var buttonClicked = $(this);

        // Launched the ship and starts the game
        if(buttonClicked.val() === 'launch') {
            game.difficulty = $difficultySetting.val();
            game.start();
        } 
        // Re-initialzes the game
        else if(buttonClicked.val() === 'restartGame') {
            game.restart();
        } 

        // DEBUGGING BUTTONS
        // if(buttonClicked.val() === 'initGame') {
        //     game.restart();
        //     countDownTimer.restart();
        // } 
        // else if(buttonClicked.val() === 'pause') {
        //     countDownTimer.pause();
        //     fuelTimer.pause();
        // } 
        // else if(buttonClicked.val() === 'start') {
        //     countDownTimer.resume();
        //     fuelTimer.resume();
        // }
        // else if(buttonClicked.val() === 'restart') {
        //     countDownTimer.restart();
        //     fuelTimer.restart();
        // }
        // else if(buttonClicked.val() === 'skip') {
        //     game.updateSpacePosition();
        //     game.nextQuestion(true);
        // } 
        // else if(buttonClicked.val() === 'show') {
        //     console.log(game.questions);
        // } 
    });
});
