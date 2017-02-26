$(document).ready(function() {
    console.log("YAY!")


    // TODOs:
    //      Create events for correct and incorrect answers
    //          These will change gameplay settings
    //              The settings will have thier own events that watch for value changes
    //      
    //              Create events for when the question difficulty increases
    //                  have error level indicator(green, yellow, red)

    // ==========================
    // =      Game Config       =
    // ==========================
    var gameConfig = {
        // Various game difficultyLevels and thier settings
        difficultyLevels: [
            {
                difficulty: 0, 
                questions: 15,
                maxErrors: 5
            }, 
            {
                difficulty: 1, 
                questions: 21,
                maxErrors: 3
            }, 
            {
                difficulty: 2, 
                questions: 30,
                maxErrors: 1
            }
        ],

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

    // TEMPORARY: these values will be replaced with user selected options
    var selectedAstonaut = 0;
    var selectedDifficulty = 0;


    function getRandomFromArray(array) {
        var randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }

    // var game;
    // var countDownTimer;
    // TODO: move this to the game config object as a property and replace all calls to it with appropriate call
    var startTime = 10;

    // TODO: Change these to spawn new elements instead of referencing exisiting ones
    // HTML Game Elements
    var $question = $('.question');
    var $clock = $('.clock');

    var $fuel = $('.fuel');
    var $fuelGauge = $('.fuelGaugeFillerCover');
    var $fuelGaugeReserve = $('.fuelGaugeFillerReserve');
    var $controls = $('.controlsWrapper');
    var $currentQuestion = $('.currentQuestions');
    var $maxQuestions = $('.maxQuestions');

    var $spaceWrapper = $('.spaceWrapper');
    
    var $rocket = $('.rocket');
    var $flameOne = $('#flameOne');
    var $flameTwo = $('#flameTwo');
    var $moon = $('.moon');
    var $ground = $('.grass');

    // -------------------------
    // - Setup Countdown Timer -
    // -------------------------
    // console.log('[NEW TIMER]');

    var countDownTimer = {
        // The object that will hold the timer
        timer: {},
        
        // The inital start time, should never be manipulated
        startTime: startTime,
        
        // The current time
        currentTime: startTime,
        
        // The interval between the timer tics
        interval: 1000,
        
        // Updates the timer html element with current time
        // TODO: Make an event listener for when the currentTime changes, then update element
        updateClockElement: function() {
            var leadingZero = '';
            if(String(this.currentTime).length === 1) {
                leadingZero = '0';
            }

            $clock.html(`00:${leadingZero}${this.currentTime}`);
        },

        // This function runs every time the time counts down
        countDown: function() {

            // Check if the timer has reached zero, if it has reset the timer and skip the current question 
            if(this.currentTime < 0) {
                this.currentTime = this.startTime;
                game.nextQuestion(false);
            }

            // Update HTML Element with new time
            this.updateClockElement();

            // Count down
            this.currentTime--;
        },

        // Intitializes the timer object
        initialize: function() {
            // console.log('[INIT]');
            this.timer = window.setInterval(function() { countDownTimer.countDown() }, this.interval);
        },

        // Resumes the timer
        resume: function() {
            // console.log('[RESUME]');
            this.initialize();
        },

        // Pauses the timer
        pause: function() {
            // console.log('[PAUSE]');
            window.clearInterval(this.timer);
        },

        // Resets the timer using the default value from the config
        restart: function() {
            // console.log('[RESTART]');

            // Reset current time
            this.currentTime = this.startTime;
            this.pause();
            
            // Update HTML Element with new Time
            this.updateClockElement();
            this.initialize();
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

        // Selected astronaut
        astronaut: 0,

        // Maximum fuel, should not be manipulated after initialzed
        maxFuel: 0,

        // Current fuel
        currentFuel: 0,

        // Total number of questions
        numberOfQuestions: 0,

        // The current question
        currentQuestion: 0,
        
        // An array of questions
        questions: [],

        spacePosition: 0,

        errors: 0,

        rocketLuanched: false,

        initialize: function() {
            this.difficulty = gameConfig.difficultyLevels[selectedDifficulty].difficulty;
            this.astronaut = gameConfig.astronauts[selectedAstonaut];
            this.numberOfQuestions = gameConfig.difficultyLevels[selectedDifficulty].questions;
            this.questions = [];
            this.currentQuestion = 0;
            this.errors = 0;

            this.generateQuestions(game.numberOfQuestions + gameConfig.difficultyLevels[selectedDifficulty].maxErrors);

            this.spacePosition = this.getCurrentProgress();
            this.maxFuel = this.getCurrentProgress();
            this.currentFuel = this.getCurrentProgress();


            this.rocketLuanched = false

            $rocket.removeClass('space');
            $ground.removeClass('hide');
            $moon.addClass('hide');
            this.updateHTML();
        },

        start: function() {
            this.initialize();
            countDownTimer.initialize();
        }, 

        restart: function() {
            this.initialize();
            countDownTimer.restart();
        },

        getCurrentProgress: function() {
            var currentQuestion = this.currentQuestion;
            var progress = Math.floor(
                (((this.numberOfQuestions - 1) - currentQuestion) / (this.numberOfQuestions - 1) ) * 100
            );

            if(progress >= 0){
                return progress;
            }
        },

        getCurrentFuel: function() {
            var currentQuestion = this.currentQuestion;
            var maxErrors = gameConfig.difficultyLevels[this.difficulty].maxErrors;

            var fuel = Math.floor(
                (((this.numberOfQuestions - 1 + maxErrors) - currentQuestion) / (this.numberOfQuestions - 1 + maxErrors) ) * 100
            );

            if(fuel >= 0){
                return fuel;
            }
        },

        getReserveFuel: function() {
            var currentQuestion = this.currentQuestion;
            var maxErrors = gameConfig.difficultyLevels[this.difficulty].maxErrors;

            var fuel = Math.floor(
                ((maxErrors - 1) / (this.numberOfQuestions - 1)) * 100
            );

            if(fuel >= 0){
                return fuel;
            }
        },

        nextQuestion: function(correctAnswer = false) {
            console.log('NEXT QUESTION');
            // Checks to see if the current question is NOT the last one in the array

            // if(this.currentQuestion < this.questions.length - 1 && this.errors < gameConfig.difficultyLevels[this.difficulty].maxErrors) {
            if(this.currentQuestion < this.questions.length - 1) {
                // Increment to next question
                this.currentQuestion += 1;
                
                // If the answer was correct consume fuel
                if(correctAnswer) {
                    console.log('CORRECT');
                    if(!this.rocketLuanched) {
                        // console.log('ROCKET LAUNCHED');
                        this.rocketLuanched = true;
                        $flameOne.removeClass('flamesOff');
                        $flameTwo.removeClass('flamesOff');
                        $rocket.addClass('space');
                        $ground.addClass('hide');
                    }
                    // Calculate fuel to consume, them consume
                    // this.currentFuel = this.currentFuel - (this.questions.length * 0.05);

                    this.updateFuel();
                    if(this.currentQuestion === this.questions.length - 1){
                        $moon.removeClass('hide');
                        $flameOne.addClass('flamesOff');
                        $flameTwo.addClass('flamesOff');
                        $controls.addClass('moonLanding');
                        $rocket.addClass('moonLanding');
                        console.log('GAME OVER, YOU WIN');
                    }
                }
                // else if(this.errors < gameConfig.difficultyLevels[this.difficulty].maxErrors){
                //     // console.log('MYError!' + Math.random());
                //     this.errors = this.errors + 1;

                //     if(this.errors >= gameConfig.difficultyLevels[this.difficulty].maxErrors){
                //         console.log('GAME OVER, YOU LOSE');
                //     }
                // }

                this.updateHTML();
            }

        },

        // Generates an array of questions based on the selected game difficulty
        generateQuestions: function(numberOfQuestions) {
            var stepSize = (numberOfQuestions / 3)

            for(var difficultyStep = stepSize; difficultyStep <= numberOfQuestions; difficultyStep = difficultyStep + stepSize) {
                var questionDifficulty = (difficultyStep / stepSize) - 1;
                for(var i = 0; i < stepSize; i++) {
                    this.questions.push(this.generateQuestion(questionDifficulty));
                }
                // if(questionDifficulty === 2) {
                //     for(var i = 0; i < gameConfig.difficultyLevels[this.difficulty].maxErrors; i++) {
                //         this.questions.push(gameConfig.difficultyLevels[this.difficulty].maxErrors);
                //     }
                // }
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
            return {question, answer, questionDifficulty};
        },
        
        // Moves the space backbround based on the progress percentage
        updateSpacePosition: function() {        
            console.log('MOVING');
            // Check to see if the end had been reached
            if(this.spacePosition > 0) {
                // Update New Space Position
                this.spacePosition = this.getCurrentProgress();
                this.updateHTML();
            }
        },

        // Updates current fuel level with new percentage value based on the current question vs total questions
        updateFuel: function() {
            this.currentFuel = this.getCurrentFuel();
            this.updateHTML();
        },

        updateHTML: function() {
            $fuel.html(`Fuel ${this.currentFuel} / ${this.maxFuel}`);
            $fuelGauge.css('width', `${this.maxFuel - this.currentFuel}%`);
            $fuelGaugeReserve.css('width', `${this.getReserveFuel()}%`);

            // $maxError.html(gameConfig.difficultyLevels[this.difficulty].maxErrors);
            // $currentError.html(this.errors);
            $currentQuestion.html(this.currentQuestion + 1);
            $maxQuestions.html(this.numberOfQuestions);

            if(this.questions[this.currentQuestion].questionDifficulty === 1) {
                $question.addClass('mediumQuestion');
            }
            else if(this.questions[this.currentQuestion].questionDifficulty >= 2) {
                $question.addClass('largeQuestion');
            }

            $question.html(this.questions[this.currentQuestion].question);
            $spaceWrapper.css('background-position', `center ${this.spacePosition}%`);
        },
    }

    game.start();

    // ==========================
    // =     Event Handers      =
    // ==========================

    $('button.answer').on('click', function() {
        var buttonClicked = $(this);
        if(eval(buttonClicked.val()) === game.questions[game.currentQuestion].answer) {
            console.log('CORRECT');

            // Add animation class for when the answer is correct
            $question.addClass('correct');
            
            $question.on("webkitAnimationEnd oAnimationEnd msAnimationEnd animationend", function(e) {
                // remove animation for when the answer is correct
                if(e.originalEvent.animationName === 'flashCorrect') {
                    $question.removeClass('correct');
                    game.updateSpacePosition();
                    countDownTimer.restart();
                // console.log(e.originalEvent.animationName);
                }
                

            });
            game.nextQuestion(true);
        }
        else {
            console.log('WRONG');
            $question.addClass('incorrect');
            
            $question.on("webkitAnimationEnd oAnimationEnd msAnimationEnd animationend", function(e) {
                if(e.originalEvent.animationName === 'flashIncorrect') {
                    // remove animation for when the answer is correct
                    $question.removeClass('incorrect');
                    countDownTimer.restart();
                }
            });
            game.nextQuestion(false);
        }
    });

    $('button').on('click', function() {
        // A variable to hold the button that was clicked
        var buttonClicked = $(this);


        // if(buttonClicked.val() === 'initGame') {
        //     game.restart();
        //     countDownTimer.restart();
        // } 
        // else if(buttonClicked.val() === 'pause') {
        //     countDownTimer.pause();
        // } 

        // else if(buttonClicked.val() === 'start') {
        //     countDownTimer.resume();
        // }
        // else if(buttonClicked.val() === 'restart') {
        //     countDownTimer.restart();
        // }
        // else 

        if(buttonClicked.val() === 'skip') {
            game.updateSpacePosition();
            game.nextQuestion(true);
        } 

        if(buttonClicked.val() === 'show') {
            console.log(game.questions);
        } 
    });
});
