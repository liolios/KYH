var State = function(old) {
	/*
	 * the player who has the turn to play
	 */
	 this.turn = "";
	
	/*
	 * the number of moves of the AI player
	 */
	 this.oMovesCount = 0;
	
	/*
	 * the result of the game in this State
	 */
	 this.result = "still running";

	/*
     * public : the board configuration in this state
     */
     this.board = [];

	/* Begin Object Construction */

     if(typeof old !== "undefined") {
 	// if the state is constructed using a copy of another state
     	let len = old.board.length;
     	this.board = new Array(len);
     	for(let i = 0 ; i < len ; i++) {
     		this.board[i] = old.board[i];
     	}

     	this.oMovesCount = old.oMovesCount;
     	this.result = old.result;
     	this.turn = old.turn;
     }
    /* End Object Construction */
    
    /*
     * advances the turn in a the state
	 */
	 this.advanceTurn = function() {
	 	this.turn = this.turn === "X" ? "O" : "X";
	 }
	
	/*
     * public function that enumerates the empty cells in state
     * @return [Array]: indices of all empty cells
     */
     this.emptyCells = function() {
     	let indxs = [];
     	for(var i = 0; i < 9; i++) {
     		if(this.board[i] === "E") {
     			indxs.push(i);
     		}
     	}
     	return indxs;
     }
    /*
     * public  function that checks if the state is a terminal state or not
     * the state result is updated to reflect the result of the game
     * @returns [Boolean]: true if it's terminal, false otherwise
     */
     this.isTerminal = function() {
     	let B = this.board;

     	//check rows
     	for(let i = 0; i <= 6; i = i + 3) {
     		if (B[i] !== "E" && B[i] === B[i + 1] && B[i + 1] == B[i + 2]) {
     			this.result = B[i] + "-won"; //update the state result
     			return true;
     		}
     	}
     	//check columns
        for(var i = 0; i <= 2 ; i++) {
            if(B[i] !== "E" && B[i] === B[i + 3] && B[i + 3] === B[i + 6]) {
                this.result = B[i] + "-won"; //update the state result
                return true;
     		}
     	}
     	//check diagonals
        for(var i = 0, j = 4; i <= 2 ; i = i + 2, j = j - 2) {
            if(B[i] !== "E" && B[i] == B[i + j] && B[i + j] === B[i + 2*j]) {
                this.result = B[i] + "-won"; //update the state result
                return true;
     		}
     	}

     	let available = this.emptyCells();
     	if(available.length == 0) {
     		//the game is draw
     		this.result = "draw"; // update the state result
     		return true;
     	}
     	else {
     		return false;
     	}
  };

};
/*
 * Constructs a game object to be played
 * @param autoPlayer [AIPlayer] : the AI player to be play the game with
 */
let Game = function(autoPlayer) {
//initizalize the ai player for this game
	this.ai = autoPlayer;

//initizialize the game current state to empty board configuration
	this.currentState = new State();

//"E" stands for empty board cell
	this.currentState.board = ["E","E","E",
							               "E","E","E",
							               "E","E","E"];

	this.currentState.turn = "X"; // the X plays first

 /*
  * Inizitizalize game status to beggining
  */
  this.status = "beggining";

 /*
  * function that advances the game to a new state
  */
    this.advanceTo = function(_state) {
        this.currentState = _state;
        if(_state.isTerminal()) {
            this.status = "ended";

            if(_state.result === "X-won")
                //X won
                ui.switchViewTo("won");
            else if(_state.result === "O-won")
                //X lost
                ui.switchViewTo("lost");
            else
                //it's a draw
                ui.switchViewTo("draw");
        }
        else {
            //the game is still running

            if(this.currentState.turn === "X") {
                ui.switchViewTo("human");
            }
            else {
                ui.switchViewTo("robot");

                //notify the AI player its turn has come up
                this.ai.notify("O");
            }
        }
    };

  /*
   * starts the game
   */

   this.start = function() {
   		if(this.status = "beggining") {
   		//invoke advanceTo with the initial state
   			this.advanceTo(this.currentState);
   			this.status = "running";
   		}
   }
};
/*
 * static function that calculates the score of the x player in a terminal state
 * [State]: the state in which the score is calculated
 * [Number]: the score calculated for the human player
 */
Game.score = function(_state) {
    if(_state.result === "X-won"){
        // the x player won
        return 10 - _state.oMovesCount;
    }
    else if(_state.result === "O-won") {
        //the x player lost
        return -10 + _state.oMovesCount;
    }
    else {
        //it's a draw
        return 0;
    }
}

