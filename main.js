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
  

// Game Board Module
(function() {

    let gameBoard = {

        gameboard: ["", "", "", "", "", "", "", "", ""],
        markContent: "X",

        init: function() {
            console.log(`The gameBoard init fxn is getting initialized`);
            this.cacheDOM();
            this.bindEvents();
            this.render();
            events.on('initialDataTransfer', this.dataSetter);

        },

        dataSetter: function(data) {
            console.log(`This dataSetter fxn is getting activated`)
            console.log(`This is the data passed over: ${data}`);
            console.log(`What the fuck`)
        },

        cacheDOM: function() {
            this.boardSquares = document.querySelectorAll('.board-squares');
            this.gameBoardDOMElem = document.querySelector('#gameboard');
            this.clearBoardBtn = document.querySelector('#clear-btn');
            this.notificationDiv = document.querySelector('#notification-div');
        },

        bindEvents: function() {
            this.gameBoardDOMElem.addEventListener('click', this.clickHandler.bind(this));
            this.clearBoardBtn.addEventListener('click', this.clearBoard.bind(this));
            events.on('newPlayerMarkSet', this.markHandler.bind(this));
            // events.on('initialDataTransfer', this.dataSetter.bind(this));
        },

        clickHandler: function(e) {
            if (this.gameboard[e.target.id].length === 0) {
                this.addSelectionToGameBoardArray(e);
            } else {
                this.notificationDiv.innerText = "You cannot select a square that's already been chosen.";
            }
        },

        markHandler: function(mark) {
            this.markContent = mark;
        },

        addSelectionToGameBoardArray: function (e) {
            if (this.notificationDiv.innerText.length > 0) {
                this.notificationDiv.innerText = '';
            }
            this.gameboard[e.target.id] = this.markContent;
            console.log(this.gameboard);
            this.render();
            events.emit('turnChanged', this.markContent);
        },

        clearBoard: function() {
            this.gameboard = ["", "", "", "", "", "", "", "", ""];
            console.log(`This is gameboard after clearBoard: ${this.gameboard}`);
            this.render();
            events.emit('clearBoardResetTurnOnScreen');
            events.emit('resetPlayerTurnDefault');
        },

        render: function () {
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
    
    // On Initialization, Player 1's turn is first
    player1Turn: true,

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
        events.on('turnChanged', this.changePlayerTurn.bind(this));
        events.on('clearBoardResetTurnOnScreen', this.resetTurnOnScreen.bind(this));
        events.on('resetPlayerTurnDefault', this.resetPlayerTurnDefault.bind(this));
    },
    
    // Change Player Turn
    changePlayerTurn: function(playersMark) {
        if (playersMark === "X") {
            this.player1Turn = false;
        } else {
            this.player1Turn = true;
        }
        this.changePlayerTurnOnScreen(this.player1Turn);
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

        markToSend: "X",

        init: function() {
            this.bindEvents();
        },

        bindEvents: function() {
            events.on('turnChangedSetMark', this.emitMark.bind(this))
        },

        emitMark: function(currentPlayerTurn) {

            console.log(`This is the mark of player1: ${this.player1.mark}`);
            console.log(`This is the mark of player2: ${this.player2.mark}`)

            // Player1's Turn
            if (currentPlayerTurn) {
                this.markToSend = this.player1.mark;
            } 
            
            // Player2's Turn
            else {
                this.markToSend = this.player2.mark;
            }

            events.emit('newPlayerMarkSet', this.markToSend)

        }
    }

    playerEventHandler.init();

})();
