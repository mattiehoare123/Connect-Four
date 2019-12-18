import Component from "@ember/component";
// The function clones the state matrix which helps in the minimax algrorithm as it holds all the possible moves
function deepClone(state) {
  var new_state = [];
  for(var idx1 = 0; idx1 < state.length; idx1++) {
    new_state.push(state[idx1].slice(0));
  }
  return new_state;
}
var patterns = [
  //If four counters are next to each other
  {
    pattern: [['p', 0, 1], ['p', 0, 1], ['p', 0, 1], ['p']],
    score: 1000
  },
  {
    pattern: [['p', 1, 0], ['p', 1, 0], ['p', 1, 0], ['p']],
    score: 1000
  },
  {
    pattern: [['p', 1, 1], ['p', 1, 1], ['p', 1, 1], ['p']],
    score: 1000
  },
  {
    pattern: [['p', 1, -1], ['p', 1, -1], ['p', 1, -1], ['p']],
    score: 1000
  },
  //If three markers are next to each other
  {
    pattern: [['p', 0, 1], ['p', 0, 1], ['p']],
    score: 50
  },
  {
    pattern: [['p', 1, 0], ['p', 1, 0], ['p']],
    score: 50
  },
  {
    pattern: [['p', 1, 1], ['p', 1, 1], ['p']],
    score: 50
  },
  {
    pattern: [['p', 1, -1], ['p', 1, -1], ['p']],
    score: 50
  },
];
/*
The first two if statements check whether the x and y cooridates are the next in line coordinates
then check that the next pattern element is still within the limits of it's state
*/
function match_pattern_at(state, pattern, player, x, y) {
  if(x >= 0 && x < state.length) {
    if(y >= 0 && y < state[x].length) {
      var element = pattern[0];
      // Check whether the type of the part is 'p'
      if(element[0] == 'p') {
        if(state[x][y] !== player) {
          return false;
        }
      } else if(element[0] == ' '){ // Check whether that the square is empty
        if(state[x][y] !== undefined) {
          return false;
        }
      }
      /*
      Check whether the pattern has more than one component in, if so then all the components
      in the pattern have not been matched so therefore call the function to check the rest of the pattern.
      The x and y cooridates are updated with the patterns second and third. If there is just one element in the pattern
      then therefore we know the pattern has matched so return true.
      */
      if(pattern.length > 1) {
        return match_pattern_at(state, pattern.slice(1), player, x + element[1], y + element[2])
      } else {
        return true;
      }
    }
  }
  return false;
}
/*
Loops over all the squares in the state then uses the function match_pattern to check whether
that pattern matches for the player at the the cooridates of idx1 / idx2. Firstly it clarify what a pattern is in the match_pattern_at function.
*/
function match_pattern(state, pattern, player) {
  for(var idx1 = 0; idx1 < state.length; idx1++) {
    for(var idx2 = 0; idx2 < state[idx1].length; idx2++) {
      var matches = match_pattern_at(state, pattern, player, idx1, idx2);
      if(matches) {
        return true;
      }
    }
  }
  return false;
}
/*
Loops over a list of patterns in the pattern object. Then call the match_pattern function
to check whether the pattern matches for the player. For the computer the score is added if the score
is for the player then the score is taken away. Doing this determines how good the position is for the computer
and the human player. A score which is under 0 means the human has the advantage and a score above 0 means the
the computer player is in the benefit.
*/
function heuristic(state) {
  var score = 0;
  for(var idx = 0; idx < patterns.length; idx++) {
    if(match_pattern(state, patterns[idx].pattern, 'red')) {
      score = score + patterns[idx].score;
    }
    if(match_pattern(state, patterns[idx].pattern, 'yellow')) {
      score = score - patterns[idx].score;
    }
  }
  return score;
}
function minimax(state, limit, player) {
  var moves = []
  if(limit > 0) {
    for(var idx1 = 0; idx1 < 7; idx1++) {
      for(var idx2 = 0; idx2 < 6; idx2++) {
        if(state[idx1][idx2] === undefined) {
          /*
          Drop the y of the marker to 5 which is the bottom of the grid if that slot in unaviable
          then move up the grid by one by taking 1 of 5
          */
          idx2 = 5;
          while(state[idx1][idx2]) {
            --idx2;
          }
          var move = {
            x: idx1,
            y: idx2,
            // This is to store the state after the move
            state: deepClone(state),
            score: 0
          };
          move.state[idx1][idx2] = player;
          // Check whether the player is at a leaf in the game or is at the interal node
          if(limit === 1 || check_game_winner(move.state) !== undefined) {
            // Handling the leaves
            move.score = heuristic(move.state);
            if(check_game_winner(move.state) !== undefined) {
              var winner = check_game_winner(move.state);
              // If the winner is red the computer score to 1000 which shows a very good result
              if(winner === 'red') {
                move.score = 1000;
              }
              // If the winner is the player then set their score to -1000 which shows it's bad
              else if(winner === 'yellow') {
                move.score = -1000;
              }
            }
          }
          // Handling the internal node
          else {
            // Rescursivley caluclate all of the possible moves, the limit is reduced by 1 then the player is switched,
            // the result of this is a list of all the possible moves which is on the move.state which is assigned to the variable
            move.moves = minimax(move.state, limit - 1, player == 'yellow' ? 'red' : 'yellow');
            // This is the first move so it has no score
            var score = undefined;
            for(var idx3 = 0; idx3 < move.moves.length; idx3++) {

              if(score === undefined) {
                score = move.moves[idx3].score;
              } else if(player === 'yellow') {
                // List of the next potential moves made by the computer and pick the best one
                score = Math.max(score, move.moves[idx3].score);
              } else if(player === 'red') {
                // List of next potential moves made by the player and then pick the worst move as it think's the player will choose this one
                score = Math.min(score, move.moves[idx3].score);
              }
            }
            move.score = score;
          }
          moves.push(move);
        }
      }
    }
  }
  return moves;
}
function check_game_winner(state) {
  let patterns = [
    /*
    Pattern matching where it checks where any of these patterns are a match
    if so then a player has four in a row, the work by checking the y and x coordinates
    */
    // <--------Diagonal-------->
    //Line One Diagonal Left
    [[0, 0], [1, 1], [2, 2], [3, 3]],
    [[1, 0], [2, 1], [3, 2], [4, 3]],
    [[2, 0], [3, 1], [4, 2], [5, 3]],
    //Line One Diagonal Right
    [[6, 0], [5 ,1], [4, 2], [3, 3]],
    [[5, 0], [4, 1], [3, 2], [2, 3]],
    [[4, 0], [3, 1], [2, 2], [1, 3]],
    [[3, 0], [2, 1], [1, 2], [0, 3]],
    //Line Two Diagonal Left
    [[0, 1], [1, 2], [2, 3], [3, 4]],
    [[1, 1], [2, 2], [3, 3], [4, 4]],
    [[2, 1], [3, 2], [4, 3], [5, 4]],
    //Line Two Diagonal Right
    [[6, 1], [5, 2], [4, 3], [3, 4]],
    [[5, 1], [4, 2], [3, 3], [2, 4]],
    [[4, 1], [3, 2], [2, 3], [1, 4]],
    [[3, 1], [2, 2], [1, 3], [0, 4]],
    //Line Three Diagonal Left
    [[0, 2], [1, 3], [2, 4], [3, 5]],
    [[1, 2], [2, 3], [3, 4], [4, 5]],
    [[2, 2], [3, 3], [4, 4], [5, 5]],
    //Line Three Diagonal Right
    [[6, 2], [5, 3], [4, 4], [3, 5]],
    [[5, 2], [4, 3], [3, 4], [2, 5]],
    [[4, 2], [3, 3], [2, 4], [1, 5]],
    [[3, 2], [2, 3], [1, 4], [0, 5]],
    // <--------Horizontal-------->
    //Line One Horizontal
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 1], [0, 2], [0, 3], [0, 4]],
    [[0, 2], [0, 3], [0, 4], [0, 5]],
    //Line Two Horizontal
    [[1, 0], [1, 1], [1, 2], [1, 3]],
    [[1, 1], [1, 2], [1, 3], [1, 4]],
    [[1, 2], [1, 3], [1, 4], [1, 5]],
    //Line Three Horizontal
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[2, 1], [2, 2], [2, 3], [2, 4]],
    [[2, 2], [2, 3], [2, 4], [2, 5]],
    //Line Four Horizontal
    [[3, 0], [3, 1], [3, 2], [3, 3]],
    [[3, 1], [3, 2], [3, 3], [3, 4]],
    [[3, 2], [3, 3], [3, 4], [3, 5]],
    //Line Five Horizontal
    [[4, 0], [4, 1], [4, 2], [4, 3]],
    [[4, 1], [4, 2], [4, 3], [4, 4]],
    [[4, 2], [4, 3], [4, 4], [4, 5]],
    //Line Six Horizontal
    [[5, 0], [5, 1], [5, 2], [5, 3]],
    [[5, 1], [5, 2], [5, 3], [5, 4]],
    [[5, 2], [5, 3], [5, 4], [5, 5]],
    //Line Seven Horizontal
    [[6, 0], [6, 1], [6, 2], [6, 3]],
    [[6, 1], [6, 2], [6, 3], [6, 4]],
    [[6, 2], [6, 3], [6, 4], [6, 5]],
    // <--------Vertical-------->
    //Line One Vertical
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[1, 0], [2, 0], [3, 0], [4, 0]],
    [[2, 0], [3, 0], [4, 0], [5, 0]],
    [[2, 0], [3, 0], [4, 0], [5, 0]],
    [[3, 0], [4, 0], [5, 0], [6, 0]],
    //Line Two Vertical
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[1, 1], [2, 1], [3, 1], [4, 1]],
    [[2, 1], [3, 1], [4, 1], [5, 1]],
    [[3, 1], [4, 1], [5, 1], [6, 1]],
    //Line Three Vertical
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 2], [2, 2], [3, 2], [4, 2]],
    [[2, 2], [3, 2], [4, 2], [5, 2]],
    [[3, 2], [4, 2], [5, 2], [6, 2]],
    //Line Four Vertical
    [[0, 3], [1, 3], [2, 3], [3, 3]],
    [[1, 3], [2, 3], [3, 3], [4, 3]],
    [[2, 3], [3, 3], [4, 3], [5, 3]],
    [[3, 3], [4, 3], [5, 3], [6, 3]],
    //Line Five Vertical
    [[0, 4], [1, 4], [2, 4], [3, 4]],
    [[1, 4], [2, 4], [3, 4], [4, 4]],
    [[2, 4], [3, 4], [4, 4], [5, 4]],
    [[3, 4], [4, 4], [5, 4], [6, 4]],
    //Line Six Vertical
    [[0, 5], [1, 5], [2, 5], [3, 5]],
    [[1, 5], [2, 5], [3, 5], [4, 5]],
    [[2, 5], [3, 5], [4, 5], [5, 5]],
    [[3, 5], [4, 5], [5, 5], [6, 5]],
  ];
  //  Loop over all the patterns above
  for (let pidx = 0; pidx < patterns.length; pidx++) {
    let pattern = patterns[pidx]; //  Assign each pattern to the variable
    let winner = state[pattern[0][0]][pattern[0][1]]; // Get the states current value at the pattern's first coordinates
    if (winner) {
      //  Loop over all the cooridates at the index of 1 and if the winner coordinates do not match the cooridates of the pattern then therefore it is not a winning pattern
      for (let idx = 1; idx < pattern.length; idx++) {
        if (winner != state[pattern[idx][0]][pattern[idx][1]]) {
          winner = undefined;
          break;
        }
      }
      // After checking all the cooridates in the pattern an it matches a winning pattern then return that it's a winner
      if (winner) {
        return winner;
        console.log(pattern);
      }
    }
  }
  let draw = true;
  /*
  Loop over all the 42 squares in the grid and check whether any of the sqaures
  are undefined if so there are still sqaures avaible to be played in so therefore there is not a draw.
  If all sqaures are not undefined and there is not an winner then therefore it is a draw.
  */
  for (let x = 0; x <= 7; x++) {
    for (let y = 0; y <= 6; y++) {
      if (!state[x][y]) {
        return undefined;
      }
    }
  }
  return '';
}

function computer_move(state) {
  var moves = []
  // Loop over each sqaure within the grid to check whether it is undefined (empty)
  for(var idx1 = 0; idx1 < 7; idx1++) {
    for(var idx2 = 0; idx2 < 6; idx2++) {
      if(state[idx1][idx2] === undefined) {
        /*
        An object which handles the a potential move the computer can make with the properties
        of it's x and y cooridates and the score of zero
        */
        var move = {
          x: idx1,
          y: idx2,
          score: 0
        };
        moves.push(move);
      }
    }
  }
  // Loop over the rest of potential moves then pick a move which has the highest score then assign it to the move object
  var moves = minimax(state, 4, 'red'); // Get the intial state and search to the depth of 4 which is 2 moves for each player and the red player is to go first in the heuristic calculation
  var max_score = undefined;
  var move = undefined;
  for(var idx = 0; idx < moves.length; idx++) {
    if(max_score === undefined || moves[idx].score > max_score) {
      max_score = moves[idx].score;
      move = {
        x: moves[idx].x,
        y: moves[idx].y
      }
    }
  }
  return move;
}

export default Component.extend({
  playing: false,
  winner: undefined,
  draw: false,
  player_1: 0,
  player_2: 0,
  desktop: true,
  wait: false,

  init: function() {
    this._super(...arguments);
    // Loading the three sounds
    createjs.Sound.registerSound("assets/sounds/click.wav", "place-maker");
    createjs.Sound.registerSound("assets/sounds/falling.mp3", "falling");
    createjs.Sound.registerSound("assets/sounds/correct.wav", "winner");
    createjs.Sound.registerSound("assets/sounds/loser.wav", "loser");
    var component = this;
    document.addEventListener("deviceready", function() {
      if(!desktop) {
        var height = document.getElementById('height');
        height.classList.add('article_mobile');
      }
      if(shake) {
        shake.startWatch(function() {
          component.send("start");
        });
      }
    component.send("start");
  },false)
},

  didInsertElement: function () {
    // Gets the canvas in the html by accessing the ID of stage
    let stage = new createjs.Stage(this.$("#stage")[0]);
    // To create the drawing surface
    let board = new createjs.Shape();
    let graphics = board.graphics;
    // Setting the color of the board
    graphics.beginFill("#ffffff");
    // To create a evenly spaced 7x6 grid each grid is 50x50 this is to draw the lines of the x axis
    graphics.drawRect(1, 50, 350, 5);
    graphics.drawRect(1, 100, 350, 2);
    graphics.drawRect(1, 150, 350, 2);
    graphics.drawRect(1, 200, 350, 2);
    graphics.drawRect(1, 250, 350, 2);
    graphics.drawRect(0, 300, 350, 2);
    graphics.drawRect(0, 350, 355, 5);

    // This is to the lines of the y axis
    graphics.drawRect(0, 50, 5, 300);
    graphics.drawRect(50, 50, 2, 300);
    graphics.drawRect(100, 50, 2, 300);
    graphics.drawRect(150, 50, 2, 300);
    graphics.drawRect(200, 50, 2, 300);
    graphics.drawRect(250, 50, 2, 300);
    graphics.drawRect(300, 50, 2, 300);
    graphics.drawRect(350, 50, 5, 300);
    // Moving the board so it's central within the canvas
    board.x = 2;
    board.y = -30;
    // Hide the board for the animation in the start function
    board.alpha = 0;
    this.set('board', board);
    // Adding the board on the canvas
    stage.addChild(board);
    // Creating the markers to store within an array
    let markers = {
      'yellow': [],
      'red': []
    };
    // For each player create 21 markers as their are 42 grid spaces
    for (let x = 0; x < 21; x++) {
      //Create Player 1 Circle
      let yellow = new createjs.Shape();
      graphics = yellow.graphics;
      // Fill the colour of the circle
      graphics.beginFill('#ffff00');
      // The radius is 20 which is the size
      graphics.drawCircle(0, 0, 20);
      // Set to false so therefore all counters are not visible at once
      yellow.visible = false;
      stage.addChild(yellow);
      markers.yellow.push(yellow);

      // Create Player 2 Circle
      let red = new createjs.Shape();
      graphics = red.graphics;
      // Fill the colour of the circle
      graphics.beginFill('#FF0000');
      graphics.drawCircle(0, 0, 20);
      red.visible = false;
      stage.addChild(red);
      markers.red.push(red);
    }
    // Get the makers to place then re draw onto the the stage
    this.set("markers", markers);
    this.set("stage", stage);
    createjs.Ticker.addEventListener('tick', stage);
  },
  check_winner: function () {
    // Get the current value of the pattern first cooridates
    var state = this.get('state');
    var winner = check_game_winner(state);
    if(winner == 'yellow') {
      createjs.Sound.play("winner");
      this.set('player_1', this.player_1 + 1);
      this.set('winner', 'You Won!');
    }
    if(winner == 'red') {
      var markers = this.get('markers');
      for(var idx = 0; idx < 21; idx++) {
        for(var i =  1; idx < 5; idx) {
        createjs.Tween.get(markers.red[idx]).to({y: 750}, 500).wait(500).to({y: -100});
        }
      }
      createjs.Sound.play("loser");
      this.set('player_2', this.player_2 + 1);
      /*
      This variable creates a random number from 0 to 2 then the
      if statements check whether it's equal to that number if so then
      it displays the message associated with the statment
      */
      var random = Math.floor(Math.random() * 3);
      if(random == 0) {
        this.set('winner', 'Better Luck Next Time');
      }
      if(random == 1) {
        this.set('winner', "Is That All You've Got!");
      }
      if(random == 2) {
        this.set('winner', 'That Was Too Easy!');
      }
    }
    if(winner !== undefined) {
      if(winner === '') {
        this.set('draw', true);
    } else {
        // createjs.Sound.play("winner");
      }
    }
  },
  willDestoryElement: function() {
    this._super(...arguments);
    if(shake) {
      shake.stopWatch();
    }
  },
  // The ev is the parameter which is the original browser click event
  click: function(ev) {
    var component = this;
    /*
    Only handles clicks if user's are playing an winner has not won. It will only allow the user to click after the computer has placed their counter,
    this is so a user cannot click loads of times and win
    */
    if(component.get("playing") && !component.get("winner") && !component.get("wait")) {
      /*
      Checks that it's the canvas being clicked on then, it will only handle clicks
      within the board on the x axis from 0-355 and on y axis 20-300 because we moved the board down by 20
      */
      if(ev.target.tagName.toLowerCase() == 'canvas' && ev.offsetX >= 2 && ev.offsetY >= 20 && ev.offsetX < 395 && ev.offsetY < 320) {
        // We moved the board 55 and each column is 50 so therefore it will caluclate the row
        let x = Math.floor((ev.offsetX - 2) / 50);
        /*
        To allow the user to click any part in the column to drop their counter
        instead of dividing by 100 it is 700 because that is the height of the
        whole column
        */
        let y = Math.floor((ev.offsetY - 20) / 350);
        let state = component.get("state");
        /*
        Load the state and check whether its x & y cooridates are false as you
        can't add another marker onto of a marker
        */
        if (!state[x][y]) {
          /*
          Now that marker can be placed we drop the counter at the bottom
          by assigning it's y axis to 5
          */
          y = 5;
          /*
          While the state cooridates of x & y are true then move up the board
          by --y which means minus 1 of y
          */
          while(state[x][y]) {
            --y;
          }
          // Each time a counter is dropped play this sound
          createjs.Sound.play("place-maker");
          // Loading the move_count which tells us how many moves yellow player has made
          let move_count = component.get("moves")['yellow'];
          // Then get next marker to place from inside the didInsertElement function
          let marker = component.get("markers")['yellow'][move_count];
          state[x][y] = 'yellow';
          // Set the marker to true so it is visible
          marker.visible = true;
          if(state[x][y] == 'yellow' && window.plugins && window.plugins.toast) {
            window.plugins.toast.showShortBottom('Red '+ ' to play next');
          }
          if (state[x][y] == 'yellow') {
            var turn = document.getElementById('turn');
            turn.classList.toggle("turn");
          }
          // Multiplying the x by 50 which is the size of a column
          marker.x = 30 + x * 50;
          /*
          For the effect of dropping the marker this animation drops the marker
          from the top of the board, when it goes to the bottom of the slot it
          bounces back up into the middle of the slot giving the reality effect
          */
          createjs.Tween.get(marker).to({y: 50 + y * 50}, 250).wait(100).to({y: 45 + y * 50});
          component.check_winner(); // Check whether that player has won after placing the counter
          /*
          Setting move_1 to plus 1 so therefore the next time the player places a marker
          their marker will be choisen from the array created in the didInsertElement function
          */
          component.get("moves")['yellow'] = move_count + 1;
          // Set the variable to true which no means the user cannot click until the computer has made their move
          component.set('wait', true);
          // Putting the computer player within a timer of half a second to make a move to give it that reality effect
          setTimeout(function() {
            // Check whether the user has won or if is a draw
            if(!component.get('winner') && !component.get('draw')) {
              // Get the current state of the red marker
              var move = computer_move(state);
              // Loading the move_count which tells us how many moves red player has made
              move_count = component.get('moves')['red'];
              state[move.x][move.y] = 'red';
              if(state[move.x][move.y] == 'red' && window.plugins && window.plugins.toast) {
                window.plugins.toast.showShortBottom('Yellow '+ ' to play next');
              }
              if (state[move.x][move.y] == "red") {
                var turn = document.getElementById('turn');
                turn.classList.remove("turn");
              }
              // Then get next marker to place from inside the didInsertElement function
              marker = component.get('markers')['red'][move_count];
              // Set the marker to true so it is visible
              marker.visible = true;
              marker.x = 30 + move.x * 50;
              createjs.Sound.play("place-maker");
              createjs.Tween.get(marker).to({y: 50 + move.y * 50}, 250).wait(100).to({y: 45 + move.y * 50});
              component.get('moves')['red'] = move_count + 1;
              component.check_winner(); // Check whether that player has won after placing the counter
              component.get('stage').update(); // Update the stage to show the counter
              component.set('wait', false); // Setting the variable back to false this allows the human player to place their counter then

            }
          }, 750);
        }
      }
    }
  },
  actions: {
    start: function () {
      if(window.plugins && window.plugins.toast) {
        window.plugins.toast.showShortBottom('Yellow to play next');
      }
      var board = this.get('board');
      board.alpha = 0;
      if(this.get('playing')) {
        setTimeout(function() {
          var fade = document.getElementById('fade');
          fade.classList.remove('fade');
        }, 500);
        var markers = this.get('markers');
        for(var idx = 0; idx < 21; idx++) {
          /*
          Drop the markers off the screen for the falling effect then wait half a second so therefore
          the two animations don't clash then send them back up ready for the next game otherwise the markers will
          appear from the bottom in the next game
          */
          createjs.Tween.get(markers.yellow[idx]).to({y: 750}, 500).wait(500).to({y: -100});
          createjs.Tween.get(markers.red[idx]).to({y: 750}, 500).wait(500).to({y: -100});
          /*
          When the game is restarted the past markers from the other game that have went up to -100 on the y axis
          drop down with them which the player can see so therefore if the y cooridates are less than zero targetting the
          markers that are at -100 then make it invisible so therefore they cannot be seen dropping with the current markers of the game
          */
          if(markers.yellow[idx].y < 0) {
            markers.yellow[idx].visible = false;
          }
          if(markers.red[idx].y < 0) {
            markers.red[idx].visible = false;
          }
        }
        createjs.Sound.play("falling");
        createjs.Tween.get(board).wait(500).to({alpha: 1}, 1000);
      } else {
        createjs.Tween.get(board).to({alpha: 1}, 1000);
      }
      this.set("playing", true);
      this.set("winner", undefined);
      this.set("draw", undefined);
      this.set("state", [
        /*
        The current game is stored within a state property with the line of code above
        this property contains an array of 7 nested arrays. Within each array there are
        6 undefined which represent columns, undefined means that no player has played
        in this slot
        */
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined]
      ]);
      /*
      Counts the number of moves each player has made so therefore in the click funtion
      it whos turn it is to play
      */
      this.set("moves", { 'yellow': 0, 'red': 0 });
      this.set("player", "yellow");
      var markers = this.get("markers");
      /*
      Resetting the turn variable as this is set to undefined when the game is won so therefore
      the winner message takes the place of the turn message so therefore when the game is restarted
      this message will appear
      */
      createjs.Tween.get(board).wait(500).to({alpha: 1}, 1000);
      this.get("stage").update();
    },
    // Restart button spin when clicked on
    restart: function() {
      var img = document.getElementById('restart'); //  Get the button by getting it's by its ID
      img.classList.toggle("restart_img--rotate"); // Toggle the class so it spins forwards on first click and spins back on second click
    },
    fade: function() {
      var fade = document.getElementById('fade');
      fade.classList.add('fade');
      }
    }
  })
