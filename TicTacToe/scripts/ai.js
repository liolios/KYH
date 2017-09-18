/*
 * Constructs an action that the ai player could make
 * @param pos [Number]: the cell position the ai would make its action in
 * made that action
 */

 let AIAction = function(pos) {

 	// the position on the board that the action would put hte letter on
 	this.movePosition = pos;

 	// the minimax value of the state that the action leads to when applied
 	this.minimaxVal = 0;

 	/*
     * public : applies the action to a state to get the next state
     * @param state [State]: the state to apply the action to
     * @return [State]: the next state
     */
     this.applyTo = function(state) {
     	let next = new State(state);

     	// put the letter on the board
     	next.board[this.movePosition] = state.turn;

     	if(state.turn === "0")
     		next.oMovesCount++;

     	next.advanceTurn();

     	return next;
     }

 };

 /*
  * Public static method that defines a rule for sorting AIAction in acending manner
  */

  AIAction.ASCENDING = function(firstAction, secondAction) {
    if(firstAction.minimaxVal < secondAction.minimaxVal)
        return -1; // indicates that firstAction goes before secondAction
    else if (firstAction.minimaxVal > secondAction.minimaxVal)
        return 1; // indicates that secondAction goes before firstAction
    else
        return 0; // indicates a tie
  }
 /*
  * Public static method that defines a rule for sorting AIAction in decending manner
  */
AIAction.DECENDING = function(firstAction, secondAction) {
    if(firstAction.minimaxVal > secondAction.minimaxVal)
        return -1; // indicates  that firstAction goes before secondAction
    else if (firstAction.minimaxVal < secondAction.minimaxVal)
        return 1; // indicates that secondAction goes before firstAction
    else
        return 0; // indicates a tie
}

/*
 * Constructs an AI player with a specific level of intelligence
 * @param level [String]: the desired level of intelligence
 */

let AI = function(level) {
	// attribute: level of intelligence the player has
	let levelOfIntelligence = level;

	// attribute: the game the player is playing
	let game = {};

    /*
     * recursive function that computes the minimax value of a game state
     * [State] : the state to calculate its minimax value
     * [Number]: the minimax value of the state
     */

     function minimaxValue(state) {
        if(state.isTerminal()){
            // a terminal game state is the base case
            return Game.score(state);
        }
        else {
            let stateScore; // this stores the minimax value we'll compute

            if(state.turn === "X")
            // X maximizes -> initiailize to a value smaller than any possible score
                stateScore = -1000;
            else
            // O minimizes -> initialize to a value larger than any possible score
                stateScore = 1000;

            let availablePositions = state.emptyCells();

            //enumerate next available states using the info form available positions
            let availableNextStates = availablePositions.map(function(pos) {
                let action = new AIAction(pos);

                let nextState = action.applyTo(state);

                return nextState;
            });
    /*
     * calculate the minimax value for all available next states
     * and evaluate the current state's value
     */

     availableNextStates.forEach(function(nextState) {

        let nextScore = minimaxValue(nextState); //recursive call

        if(state.turn === "X") {
            // X wants to maximize -> update stateScore if nextScore is larger
            if(nextScore > stateScore)
                stateScore = nextScore;
        }
        else {
            // O wants to minimize -> update stateScore if nextScore is smaller
            if(nextScore < stateScore)
                stateScore = nextScore;
        }
     });
     return stateScore;
   }  
}
    /*
     * private function: make the ai player take a blind move
     * that is: choose the cell to place its symbol randomly
     * @param turn [String]: the player to play, either X or O
     */

     function takeBlindMove(turn) {
        let available = game.currentState.emptyCells();
        let randomCell = available[Math.floor(Math.random() * available.length)];
        let action = new AIAction(randomCell);

        let next = action.applyTo(game.currentState);

        ui.insertAt(randomCell, turn);

        game.advanceTo(next);
     }

    /*
     * private function: make the ai player take a novice move,
     * that is: mix between choosing the optimal and suboptimal minimax decisions
     * @param turn [String]: the player to play, either X or O
     */

     function takeANoviceMove(turn) {
        let available = game.currentState.emptyCells();

        // enumerate and a calculate the score for each available action to the ai player
        let availableActions = available.map(function(pos) {
            let action = new AIAction(pos); // create the action object

            //get next state by applying the action
            let nextState = action.applyTo(game.currentState);

            //calculate and set the action's minimax value
            action.minimaxVal = minimaxValue(nextState);

            return action;

        });

        //sort enumerated actions list by score
        if(turn === "X")
            // X maximizes -> decend sort the the actions to have the maximum minimax at first
            availableActions.sort(AIAction.DESCENDING);
        else
            // O minimizes -> ascend sort the actions to have the minimum minimax at first
            availableActions.sort(AIAction.ASCENDING);


    /*
     * take the optimal action 40% of the time
     * take the 1st supoptimal action 60 % of the time
     */

     let chosenAction;
     if(Math.random()*100 < 40) {
        chosenAction = availableActions[0];
     }
     else {
        if(availableActions.length >= 2) {
            //if there is two or more available actions, choose the 1st suboptimal
            chosenAction = availableActions[1];
        }
        else {
            //choose the only available action
            chosenAction = availableActions[0];
        }
     }
     let next = chosenAction.applyTo(game.currentState);

     ui.insertAt(chosenAction.movePosition, turn);

     game.advanceTo(next);
 };

    /*
     * private function: make the ai player take a master move,
     * that is: choose the optimal minimax decision
     * @param turn [String]: the player to play, either X or O
     */

     function takeAMasterMove(turn) {
        let available = game.currentState.emptyCells();
        //enumerate and calculate the score for each available actions to the ai player
        let availableActions = available.map(function(pos) {
            let action = new AIAction(pos); // create the action object

            //get next state by applying the actions
            let next = action.applyTo(game.currentState);

            //calculate and set the actions's minimax value
            action.minimaxVal = minimaxValue(next);

            return action;
        });

        //sort the enumerated actions list by score
        if(turn === "X")
            // X maximizes -> descend sort the actions to have the largest minimax at first
            availableActions.sort(AIAction.DESCENDING);
        else
            // O minimizes -> acend sort the actions to have the smallest minimax at first
            availableActions.sort(AIAction.ASCENDING);

        // take the first actions as it's optimal
        let chosenAction = availableActions[0];
        let next = chosenAction.applyTo(game.currentState);

        // this just adds an X or an O at the chosen position on the board UI
        ui.insertAt(chosenAction.movePosition, turn);

        // take the gmae to the next state
        game.advanceTo(next);
     }

    /*
     * public method to specify the game the ai player will play
     * @param _game [Game] : the game the ai will play
     */
	this.plays = function(_game) {
		game = _game;
	};

    /*
     * public function: notify the ai player that it's its turn
     * @param turn [String]: the player to play, either X or O
     */
     this.notify = function(turn) {
     	switch(levelOfIntelligence){
     		//invoke the desired behaviour based on the level chosen
     		case "blind": takeBlindMove(turn); break;
     		case "novice": takeANoviceMove(turn); break;
     		case "master": takeAMasterMove(turn); break;
     	}
     };

};