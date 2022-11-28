// PubSub/Mediator
var events = {
    events: {},

    on: function (eventName, fn) {
      this.events[eventName] = this.events[eventName] || [];
      this.events[eventName].push(fn);
    },

    off: function(eventName, fn) {
      if (this.events[eventName]) {
        for (var i = 0; i < this.events[eventName].length; i++) {
          if (this.events[eventName][i] === fn) {
            this.events[eventName].splice(i, 1);
            break;
          }
        };
      }
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function(fn) {
              fn(data);
            });
          }
    }
  };




  

// Beginning Form Popup
(function() {
    let formHandler = {

        selectedOptionClass: 'selected-option',

        mForm: '.multiplayer-form',
        aForm: '.ai-form',
        yeet: 'yeet',
        player1: '.player1',
        player2: '.player2',

        formContainerClass: '.form-container',

        m: 'm',
        a: 'a',

        init: function() {
            this.cacheDOM();
            this.bindEvents();
            this.multiplayer.classList.add(this.selectedOptionClass);
            this.aiForm.classList.add(this.yeet);
        },

        cacheDOM: function() {
            this.formPopup = document.querySelector('.form-container');
            this.multiplayer = document.querySelector('.multiplayer');
            this.ai = document.querySelector('.ai');
            this.multiplayerForm = document.querySelector(this.mForm);
            this.aiForm = document.querySelector(this.aForm);
            this.player1Box = document.querySelector(this.player1);
            this.player2Box = document.querySelector(this.player2);
            this.formContainer = document.querySelector(this.formContainerClass);
        },

        bindEvents: function() {
            this.multiplayer.addEventListener('click', this.changeOption.bind(this));
            this.ai.addEventListener('click', this.changeOption.bind(this));
            this.multiplayerForm.addEventListener('submit', this.mpGameInfo.bind(this));
            this.aiForm.addEventListener('submit', this.aiGameInfo.bind(this));
        },

        changeOption: function(e) {
            console.log(e.target.classList)
            console.log(e.target.classList[0]);

            // Clicking on Multiplayer Option
            if (e.target.classList[0] === 'multiplayer') {
                if (this.ai.classList.contains(this.selectedOptionClass)) {
                    // Highlight Multiplayer Option
                    this.ai.classList.remove(this.selectedOptionClass);
                    // Display Multiplayer Form & Hide AI Form
                    this.multiplayerForm.classList.remove(this.yeet);
                    this.aiForm.classList.add(this.yeet);
                } 

            } else {
                if (this.multiplayer.classList.contains(this.selectedOptionClass)) {
                    // Highlight AI Option
                    this.multiplayer.classList.remove(this.selectedOptionClass);

                    // Display AI Form & Hide Multiplayer Form
                    this.aiForm.classList.remove(this.yeet);
                    this.multiplayerForm.classList.add(this.yeet);
                } 
            }
            e.target.classList.add(this.selectedOptionClass);
            
        },

        mpGameInfo: function() {
        
            let p1 = document.getElementById('p1').value;
            let p2 = document.getElementById('p2').value;

            if (p1.length === 0) {
                p1 = 'Player 1'
            } 
            if (p2.length === 0) {
                p2 = "Player 2"
            }

            document.getElementById('p1').value = '';
            document.getElementById('p2').value = '';

            console.log(p1, p2);

            this.injectNames(p1, p2);

        },

        aiGameInfo: function() {
            let p3 = document.getElementById('p3').value;
            let p4 = 'AI';

            if (p3.length === 0) {
                p3 = 'Player 1'
            }

            document.getElementById('p3').value = '';

            console.log(p3);

            this.injectNames(p3, p4);

        },

        injectNames: function(p1, p2) {

            this.player1Box.innerText = p1;
            this.player2Box.innerText = p2;

            this.formTransition();

        },

        formTransition: function() {
            this.formContainer.classList.add('transition');
        },

    }

    formHandler.init();
})();







// Game Board Module
(function() {

    let gameBoard = {

        data: {markContent: this.markContent, turn: this.turn, gameboard: this.gameboard},

        oopsClass: 'oops-notif',

        init: function() {
            this.cacheDOM();
            this.bindEvents();
        },

        cacheDOM: function() {
            this.boardSquares = document.querySelectorAll('.board-squares');
            this.gameBoardDOMElem = document.querySelector('#gameboard');
            this.clearBoardBtn = document.querySelector('#clear-btn');
            this.notificationDiv = document.querySelector('#notification-div');
        },

        bindEvents: function() {
            events.on('initialDataTransfer', this.dataSetter.bind(this));
            events.on('dataTransfer', this.dataSetter.bind(this));
            events.on('initialDataTransfer', this.render.bind(this));
            this.gameBoardDOMElem.addEventListener('click', this.clickHandler.bind(this));
            this.clearBoardBtn.addEventListener('click', this.clearBoard.bind(this));
            events.on('globalUpdate', this.dataSetter.bind(this));
            // events.on('newPlayerMarkSet', this.markHandler.bind(this));
        },

        dataSetter: function(data) {
            console.log(`This is the data received in data setter within the GAMEBOARD MODULE `)
            console.log(data)

            this.gameboard = data['gameboard'];
            this.markContent = data['markContent'];
            this.turn = data['turn'];

            this.data = {markContent: this.markContent, turn: this.turn, gameboard: this.gameboard};
        },

        clickHandler: function(e) {
            console.log(`This is clickHandler`)
            console.log(this.gameboard)
            console.log(e);
            console.log(e.target);
            console.log('id: ', e.target.id);
            console.log('square length: ', this.gameboard[e.target.id].length);
            if (this.gameboard[e.target.id].length === 0) {
                this.addSelectionToGameBoardArray(e);
                events.emit('updateData', this.data);
            } else {
                this.notificationDiv.classList.add(this.oopsClass);
                this.notificationDiv.innerText = "You cannot select a square that's already been chosen.";
            }
        },

        sendDataTransferValues: function() {
            console.log(`This is the data before sending it`)
            console.log(this.data)
            events.emit('dataTransfer', this.data);
        },

        addSelectionToGameBoardArray: function(e) {
            if (this.notificationDiv.innerText.length > 0) {
                this.notificationDiv.innerText = '';
            }
            this.gameboard[e.target.id] = this.markContent;
            this.render();
            this.sendDataTransferValues();
            events.emit('turnChanged');
        },

        clearBoard: function() {
            events.emit('clearBoardResetTurnOnScreen');
            // events.emit('resetPlayerTurnDefault');
            events.emit('resetBoard');
            this.render();
            console.log(`This is gameboard after clearBoard: ${this.gameboard}`);
            this.notificationDiv.innerText = '';
        },

        render: function() {
            this.i = 0
            this.boardSquares.forEach(square => {
                square.innerText = this.gameboard[this.i];
                this.i++;
            });
        }}
    
    gameBoard.init();

})();

// Turn Handler, controls when each player can place a mark
const turnModule = (function() {

    let turnHandler = {

    data: {markContent: this.markContent, turn: this.turn, gameboard: this.gameboard},
    
    // // On Initialization, Player 1's turn is first
    // player1Turn: true,

    init: function() {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM: function() {
        this.player1Indicator = document.querySelector('.player1');
        this.player2Indicator = document.querySelector('.player2');
        this.currentTurnID = 'current-turn';
    },

    bindEvents: function() {
        events.on('dataTransfer', this.dataSetter.bind(this));
        events.on('turnChanged', this.changePlayerTurn.bind(this));
        events.on('initialDataTransfer', this.dataSetter.bind(this));
        events.on('globalUpdate', this.dataSetter.bind(this));
        
        events.on('clearBoardResetTurnOnScreen', this.resetTurnOnScreen.bind(this));
        // events.on('resetPlayerTurnDefault', this.resetPlayerTurnDefault.bind(this));
    },

    dataSetter: function(data) {
        console.log(`This is the data received in data setter within the TURNHANDLER MODULE: `)
        console.log(data)
        this.gameboard = data['gameboard'];
        this.markContent = data['markContent'];
        this.turn = data['turn'];
        console.log(this.gameboard);

        this.data = {markContent: this.markContent, turn: this.turn, gameboard: this.gameboard};

        console.log(`This is this.data`)
        console.log(this.data);
    },

    sendDataTransferValues: function() {
        console.log(this.data)
        events.emit('globalUpdate', this.data);
    },
    
    // Change Player Turn
    changePlayerTurn: function() {
        if (this.turn) {
            this.turn = false;
            console.log('This.turn is now false: ', this.turn);
        } else {
            this.turn = true;
            console.log('This.turn is now true: ', this.turn);
        }

        this.data.turn = this.turn;

        this.sendDataTransferValues();
        this.changePlayerTurnOnScreen(this.turn);
        console.log(this.turn);
        console.log(`This is the this.data after changeplayerturn: `);
        console.log(this.data);
    },

    // Change Player Indicated turn on screen
    changePlayerTurnOnScreen: function(turn) {
        if (!turn) {
            this.setPlayer2Turn();
        } else {
            this.setPlayer1Turn();
        }
        events.emit('turnChangedSetMark', turn);
    },

    // Reset Turn on Screen When Clear Board is Clicked
    resetTurnOnScreen: function() {
        console.log(`This is the classlist: ${this.currentTurnID}`);
        if (this.player2Indicator.classList.contains(this.currentTurnID)) {
            this.setPlayer1Turn();
        }
    },

    resetPlayerTurnDefault: function() {
        this.player1Turn = true;
        console.log(`This is the player1Turn status after clear board btn pressed: ${this.player1Turn}`);
    },

    setPlayer1Turn: function() {
        this.player2Indicator.classList.remove(this.currentTurnID);
        this.player1Indicator.classList.add(this.currentTurnID);
    },

    setPlayer2Turn: function() {
        this.player1Indicator.classList.remove(this.currentTurnID);
        this.player2Indicator.classList.add(this.currentTurnID);
    }}

    turnHandler.init(); 

})();

// Player Module: Creation & Sends gameBoard Mark Data
const PlayerModule = (function() {

    let Player = (namee, markk) => {
        let name = namee;
        let mark = markk;
        return{name, mark}
    };

    let playerEventHandler = {

        player1: Player('player1', "X"),
        player2: Player('player2', "O"),

        data: {markContent: this.markContent, turn: this.turn, gameboard: this.gameboard},

        init: function() {
            this.bindEvents();
        },

        bindEvents: function() {
            events.on('turnChangedSetMark', this.emitMark.bind(this))
            events.on('initialDataTransfer', this.dataSetter.bind(this));
            events.on('globalUpdate', this.dataSetter.bind(this));
        },

        dataSetter: function(data) {
            console.log(`This is the data received in data setter within the PLAYER EVENT HANDLER MODULE: `)
            console.log(data)
            this.gameboard = data['gameboard'];
            this.markContent = data['markContent'];
            this.turn = data['turn'];
            console.log(this.gameboard);
    
            this.data = {markContent: this.markContent, turn: this.turn, gameboard: this.gameboard};
    
            console.log(`This is this.data`)
            console.log(this.data);
        },

        emitMark: function() {

            console.log(`This is the mark of player1: ${this.player1.mark}`);
            console.log(`This is the mark of player2: ${this.player2.mark}`)

            // Player1's Turn
            if (this.data['turn']) {
                this.data['markContent'] = this.player1.mark;
            } 
            // Player2's Turn
            else {
                this.data['markContent'] = this.player2.mark;
            }
            events.emit('globalUpdate', this.data)

        }
    }

    playerEventHandler.init();

})();

  // Data Transfer Module

  const dataTransferModule = (function () {
    let dataTransfer = {
                      
        data: {},

        winningCombos: [
            // Across
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
        
            // Downwards
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
        
            // Diagonal
            [2, 4, 6],
            [0, 4, 8]
        ],

        disableClicksClass: 'disable-clicks',
        winnerStyling: 'winner-notif-style',
        nobodyWinsClass: 'nobody-wins',

        init: function() {
            this.cacheDOM();
            this.setInitialValues();
            this.bindEvents();
        },

        setInitialValues: function() {
            this.data = {markContent: "X", turn: true, gameboard: ["", "", "", "", "", "", "", "", ""]}
            console.log('This is the dataTrsfr data settting initial values: ', this.data);
            events.emit('initialDataTransfer', this.data);

            if (this.gameBoardDOMElem.classList.contains(this.disableClicksClass)) {
                this.enableClicks();
            }
        }, 

        cacheDOM: function() {
            this.gameBoardDOMElem = document.querySelector('#gameboard');
            this.notificationDiv = document.querySelector('#notification-div');
        },

        bindEvents: function() {
            events.emit('initialDataTransfer', this.data);
            events.on('updateData', this.updateValues.bind(this));
            events.on('resetBoard', this.setInitialValues.bind(this));
        },

        updateValues: function(data) {
            this.data = data;
            console.log('This is the dataTrsfr data update of GLOBAL VALUES: ', this.data);
            this.checkForWinner(this.data);
        },

        checkForWinner: function(data) {

            for (let combo of this.winningCombos) {
                let comboArray = [];

                for (let index of combo) {

                    comboArray.push(data.gameboard[index]);

                    if (data.gameboard[index] === '') {
                        break;
                    };
                }

                console.log(`This is the comboArray: `, comboArray)
                
                const winningCombo = arr => arr.every(item => item === arr[0]);
                let gameOver = winningCombo(comboArray);

                if (gameOver & comboArray.length === 3) {

                    console.log(`Game over!`);
                    console.log('This is the game result: ', gameOver);
                    this.disableClicks();
                    this.winnerHandler(comboArray[0]);
                    break;
                }

                if (!gameOver && data.gameboard.includes('') === false) {

                    this.notificationDiv.innerText = "Nobody Wins. Lol"
                    this.notificationDiv.classList.add(this.nobodyWinsClass);
                    this.disableClicks();
                }
            }

            // events.emit('globalUpdate', this.data);
        },

        enableClicks: function() {
            this.gameBoardDOMElem.classList.remove(this.disableClicksClass);
        },

        disableClicks: function() {
            this.gameBoardDOMElem.classList.add(this.disableClicksClass);
        },

        winnerHandler: function(winner) {
            if (winner === 'O' || winner === "AI") {
                this.winner = 'Player 2';
            }
            else {
                this.winner = 'Player 1';
            }
            this.notificationDiv.classList.add(this.winnerStyling);
            this.notificationDiv.innerText = `The winner is: ${this.winner}!`;
        },
    }

    dataTransfer.init();

})();




