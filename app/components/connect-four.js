import Component from "@ember/component";

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
function match_pattern_at(state, pattern, player, x, y) {
  if(x >= 0 && x < state.length) {
    if(y >= 0 && y < state[x].length) {
      var element = pattern[0];
      if(element[0] == 'p') {
        if(state[x][y] !== player) {
          return false;
        }
      } else if(element[0] == ' '){
        if(state[x][y] !== undefined) {
          return false;
        }
      }
      if(pattern.length > 1) {
        return match_pattern_at(state, pattern.slice(1), player, x + element[1], y + element[2])
      } else {
        return true;
      }
    }
  }
  return false;
}
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
function down(a, b) {
b = 5;
while(state[a][b]) {
  --b;
  }
}
function alphabeta(state, limit, player, alpha, beta) {
  var moves = []
  if(limit > 0) {
    if(player === 'red') {
      var cutoff = Number.MIN_VALUE;
    } else {
        var cutoff = Number.MAX_VALUE;
    }
    for(var idx1 = 0; idx1 < 7; idx1++) {
      for(var idx2 = 0; idx2 < 6; idx2++) {
        if(state[idx1][idx2] === undefined) {
          /*
          idx2 is the y axis so therefore drop this counter to the bottom row
          if there a marker already in the position then move up a row till
          next avaiable slot is found
          */
          idx2 = 5;
          while(state[idx1][idx2]) {
            --idx2;
          }
          var move = {
            x: idx1,
            y: idx2,
            state: deepClone(state),
            score: 0
          };
          move.state[idx1][idx2] = player;
          if(limit === 1 || check_game_winner(move.state) !== undefined) {
            move.score = heuristic(move.state);
            if(check_game_winner(move.state) !== undefined) {
              var winner = check_game_winner(move.state);
              if(winner === 'red') {
                move.score = 1000;
              } else if(winner === 'yellow') {
                move.score = -1000;
              }
            }
          } else {
            move.moves = alphabeta(move.state, limit - 1, player == 'yellow' ? 'red' : 'yellow', alpha, beta);
            var score = undefined;
            for(var idx3 = 0; idx3 < move.moves.length; idx3++) {
              if(score === undefined) {
                score = move.moves[idx3].score;
              } else if(player === 'yellow') {
                score = Math.max(score, move.moves[idx3].score);
              } else if(player === 'red') {
                score = Math.min(score, move.moves[idx3].score);
              }
            }
            move.score = score;
          }
          moves.push(move);
          if(player === 'red') {
            cutoff = Math.max(cutoff, move.score);
            alpha = Math.max(cutoff, alpha);
          } else {
            cutoff = Math.min(cutoff, move.score);
            beta = Math.min(cutoff, beta);
          }
          if(beta <= alpha) {
            return moves;
          }
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
  for (let pidx = 0; pidx < patterns.length; pidx++) {
    let pattern = patterns[pidx];
    let winner = state[pattern[0][0]][pattern[0][1]];
    if (winner) {
      for (let idx = 1; idx < pattern.length; idx++) {
        if (winner != state[pattern[idx][0]][pattern[idx][1]]) {
          winner = undefined;
          break;
        }
      }
      if (winner) {
        return winner;
      }
    }
  }
  //Assuming the game is a draw
  let draw = true;
  //Loop through each square and if it's undefined then a draw is false
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
  var moves = alphabeta(state, 4, 'red', Number.MIN_VALUE, Number.MAX_VALUE);
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
  turn: 'Player 1 Turn',
  desktop: true,

  init: function() {
    this._super(...arguments);
    //Loading the three sounds
    createjs.Sound.registerSound("assets/sounds/click.wav", "place-maker");
    createjs.Sound.registerSound("assets/sounds/falling.mp3", "falling");
    createjs.Sound.registerSound("assets/sounds/correct.wav", "winner");
    var component = this;
    document.addEventListener("deviceready", function() {
      component.set("desktop", false);
    })
  },

  didInsertElement: function () {
    let stage = new createjs.Stage(this.$("#stage")[0]);
    //draw the game board
    let board = new createjs.Shape();
    let graphics = board.graphics;

    //Adds a image to the board of a connect four grid
    var grid = new createjs.Bitmap("assets/img/board.png");
    //Place the grid in the middle of the move it down
    grid.x = 20;
    grid.y = 10;
    stage.addChild(grid);
    // graphics.beginFill("#ffffff");
    // //This is for the lines of the x axis
    // graphics.drawRect(0, 60, 700, 10);
    // graphics.drawRect(0, 159, 700, 2);
    // graphics.drawRect(1, 259, 700, 2);
    // graphics.drawRect(1, 359, 700, 2);
    // graphics.drawRect(1, 459, 700, 2);
    // graphics.drawRect(1, 559, 700, 2);
    // graphics.drawRect(0, 659, 709, 10);
    //
    // //This is for the lines of the y axis
    // graphics.drawRect(0, 60, 10, 600);
    // graphics.drawRect(99, 60, 2, 600);
    // graphics.drawRect(199, 60, 2, 600);
    // graphics.drawRect(299, 60, 2, 600);
    // graphics.drawRect(399, 60, 2, 600);
    // graphics.drawRect(499, 60, 2, 600);
    // graphics.drawRect(599, 60, 2, 600);
    // graphics.drawRect(699, 60, 10, 600);

    // let yellow_box = new createjs.Shape();
    // graphics = yellow_box.graphics;
    // graphics.beginFill('#66ff66');
    // graphics.drawRect(775, 150, 200, 200);
    // stage.addChild(yellow_box);
    //
    // let red_box = new createjs.Shape();
    // graphics = red_box.graphics;
    // graphics.beginFill('#66ff66');
    // graphics.drawRect(775, 425, 200, 200);
    // stage.addChild(red_box);
    //
    // //Player Yellow Circle
    // let yellow = new createjs.Shape();
    // graphics = yellow.graphics;
    // graphics.beginFill('#ffff00');
    // graphics.setStrokeStyle(10);
    // graphics.drawCircle(940, 185, 25, 25);
    // stage.addChild(yellow);
    //
    //Player Red Circle
    // let red = new createjs.Shape();
    // graphics = red.graphics;
    // graphics.beginFill('#FF0000');
    // graphics.setStrokeStyle(10);
    // graphics.drawCircle(800, 460, 25, 25);
    // stage.addChild(red);

    // var player_1 = new createjs.Text("Player 1", "30px Arial", "#ff7700");
    // player_1.x = 790;
    // player_1.y = 175;
    // stage.addChild(player_1);
    //
    // var score_1 = new createjs.Text(this.player_1, "30px Arial", "#ff7700");
    // score_1.x = 820;
    // score_1.y = 240;
    // stage.addChild(score_1);
    //
    // var score_2 = new createjs.Text(this.player_2, "30px Arial", "#ff7700");
    // score_2.x = 820;
    // score_2.y = 500;
    // stage.addChild(score_2);
    //
    // var points = new createjs.Text("Points", "30px Arial", "#ff7700");
    // points.x = 850;
    // points.y = 240;
    // stage.addChild(points);
    //
    // var player_2 = new createjs.Text("Player 2", "30px Arial", "#ff7700");
    // player_2.x = 790;
    // player_2.y = 450;
    // stage.addChild(player_2);

    board.x = 40;
    board.y = -20;
    // board.alpha = 0;
    this.set('grid', grid);
    this.set('board', board);
    stage.addChild(board);

    let markers = {
      'yellow': [],
      'red': []
    };
    for (let x = 0; x < 21; x++) {
      let circleMarker = new createjs.Shape();
      graphics = circleMarker.graphics;
      //Fill the colour of the circle
      graphics.beginFill('#FF0000');
      graphics.setStrokeStyle(10);
      graphics.drawCircle(0, 0, 36);
      circleMarker.visible = false;
      stage.addChild(circleMarker);
      markers.red.push(circleMarker);
      //Create Player 1 Circle

      let crossMarker = new createjs.Shape();
      graphics = crossMarker.graphics;
      //Fill the colour of the circle
      graphics.beginFill('#ffff00');
      graphics.setStrokeStyle(0);
      //The radius of the circle is 35
      graphics.drawCircle(0, 0, 36);
      //Set to false so therefore all counters are not visible at once
      crossMarker.visible = false;
      stage.addChild(crossMarker);
      markers.yellow.push(crossMarker);
    }
    this.set("markers", markers);
    this.set("stage", stage);
    createjs.Ticker.addEventListener('tick', stage);
  },
  check_winner: function () {
    var state = this.get('state');
    var winner = check_game_winner(state);
    if(winner == 'yellow') {
      this.set('player_1', this.player_1 + 1);
      this.set('winner', 'You Won!');
    }
    if(winner == 'red') {
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
        this.set('winner', 'That Was Too Easy');
      }
    }
    if(winner !== undefined) {
      if(winner === '') {
        this.set('draw', true);
    } else {
        this.set('turn', undefined);
        createjs.Sound.play("winner");
      }
    }
  },
  click: function(ev) {
    var component = this;
    if(component.get("playing") && !component.get("winner")) {
      if(ev.target.tagName.toLowerCase() == 'canvas' && ev.offsetX >= 40 && ev.offsetY >= 20 && ev.offsetX < 800 && ev.offsetY < 800) {
        let x = Math.floor((ev.offsetX - 20) / 90);
        /*
        To allow the user to click any part in the column to drop their counter
        instead of dividing by 100 it is 700 because that is the height of the
        whole column
        */
        let y = Math.floor((ev.offsetY - 20) / 480);
        let state = component.get("state");
        if (!state[x][y]) {
          y = 5;
          while(state[x][y]) {
            --y;
          }
          createjs.Sound.play("place-maker");
          let move_count = component.get("moves")['yellow'];
          let marker = component.get("markers")['yellow'][move_count];
          state[x][y] = 'yellow';
          if (state[x][y] == 'yellow') {
            component.set('turn', 'Player 2 Turn');
          }
          marker.visible = true;
          marker.x = 70 + x * 90;
          // drop = 90 + y * 100;
          /*
          For the effect of dropping the marker this animation drops the marker
          from the top of the board, when it goes to the bottom of the slot it
          bounces back up into the middle of the slot giving the reality effect
          */
          createjs.Tween.get(marker).to({y: 60 + y * 80}, 250)
          .wait(100).to({y: 50 + y * 80});
          // marker.y = 90 + y * 100;
          // createjs.Tween.get(marker).to({y: marker.y}, 500);
          component.check_winner();
          component.get("moves")['yellow'] = move_count + 1;
          setTimeout(function() {
            if(!component.get('winner') && !component.get('draw')) {
              var move = computer_move(state);
              move_count = component.get('moves')['red'];
              state[move.x][move.y] = 'red';
              if (state[move.x][move.y] == "red") {
                component.set('turn', 'Player 1 Turn');
              }
              marker = component.get('markers')['red'][move_count];
              marker.visible = true;
              marker.x = 70 + move.x * 90;
              createjs.Tween.get(marker).to({y: 60 + move.y * 80}, 250)
              .wait(100).to({y: 50 + move.y * 80});
              // marker.y = 90 + move.y * 100;
              component.get('moves')['red'] = move_count + 1;
              component.check_winner();
              component.get('stage').update();

            }
          }, 500);
        }
      }
    }
  },
  actions: {
    start: function () {
      var board = this.get('board');
      board.alpha = 0;
      if(this.get('playing')) {
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
        //Array for setting that no player has played a token within any of the slots
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined]
      ]);
      this.set("moves", { 'yellow': 0, 'red': 0 });
      this.set("player", "yellow");
      var markers = this.get("markers");
      /*
      Resetting the turn variable as this is set to undefined when the game is won so therefore
      the winner message takes the place of the turn message so therefore when the game is restarted
      this message will appear
      */
      this.set('turn', 'Player 1 Turn');
      this.get("stage").update();
    },
    restart: function() {
      console.log('working');
      var img = document.getElementById('restart');
      img.classList("big");
    },
  }
});
