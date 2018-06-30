var rounds = {
    1: [],
    2: [],
    3: [],
    4: []
};

$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: '/getFourthRoundTeams',
        success: parseTeams
    });
});

function parseTeams(raw){
    var data = JSON.parse(raw);
    for (var i = 0; i < 8; i++){
        rounds[1].push({
            top: {
                id: data[i].team1Id,
                name: data[i].team1Name,
                score: data[i].team1Score
            },
            bottom: {
                id: data[i].team2Id,
                name: data[i].team2Name,
                score: data[i].team2Score
            },
            winner: ((data[i].team1Score > data[i].team2Score) ? 'top': 'bottom')
        });
    }
    for (var i = 8; i < 12; i++){
        rounds[2].push({
            top: {
                id: data[i].team1Id,
                name: data[i].team1Name,
                score: data[i].team1Score
            },
            bottom: {
                id: data[i].team2Id,
                name: data[i].team2Name,
                score: data[i].team2Score
            },
            winner: ((data[i].team1Score > data[i].team2Score) ? 'top': 'bottom')
        });
    }
    for (var i = 12; i < 14; i++){
        rounds[3].push({
            top: {
                id: data[i].team1Id,
                name: data[i].team1Name,
                score: data[i].team1Score
            },
            bottom: {
                id: data[i].team2Id,
                name: data[i].team2Name,
                score: data[i].team2Score
            },
            winner: ((data[i].team1Score > data[i].team2Score) ? 'top': 'bottom')
        });
    }
    for (var i = 14; i < 16; i++){
        rounds[4].push({
            top: {
                id: data[i].team1Id,
                name: data[i].team1Name,
                score: 0
            },
            bottom: {
                id: data[i].team2Id,
                name: data[i].team2Name,
                score: 0
            },
            winner: null
        });
    }
    $.ajax({
        type: 'GET',
        url: '/getRound4Picks',
        success: getUserPicks
    });
};

function getUserPicks(raw){
    var data = JSON.parse(raw);
    data.forEach(function(pick){
        if (rounds[pick.roundId][pick.matchId].top.id === pick.winner)
            rounds[pick.roundId][pick.matchId].winner = 'top';
        else
            rounds[pick.roundId][pick.matchId].winner = 'bottom';
        rounds[pick.roundId][pick.matchId].top.score = pick.team1_score;
        rounds[pick.roundId][pick.matchId].bottom.score = pick.team2_score;
    });
    refreshHTML();
}

function refreshRound(round){
    for (var i = 0; i < rounds[round-1].length; i+=2){
        var winnerTop = rounds[round-1][i].winner;
        var winningTeamTop = rounds[round-1][i][winnerTop];
        var winnerBottom = rounds[round-1][i+1].winner;
        var winningTeamBottom = rounds[round-1][i+1][winnerBottom];
       
        rounds[round][(i/2)].top = {
            id: (winningTeamTop) ? winningTeamTop.id : 0,
            name: (winningTeamTop) ? winningTeamTop.name : 'TBD'
        };
        rounds[round][(i/2)].bottom = {
                id: (winningTeamBottom) ? winningTeamBottom.id : 0,
                name: (winningTeamBottom) ? winningTeamBottom.name : 'TBD'
        };
    }
    refreshHTML();
}

function refreshHTML(){
    $('#tournament').empty();
    $('#finals').empty();
    for (var i = 1; i < 4; i ++){
        var html = '<ul class="round round-' + i + '"><li class="spacer">&nbsp;</li>';
        for (var j = 0; j < (rounds[i].length / 2); j++){
            html += '<li class="game game-top' + ((rounds[i][j].winner === 'top') ? ' winner' : '');
            html += '">' + rounds[i][j].top.name + ((i === 4) ? ' <input type="number" id="score' + i + '_' + j + 'top" oninput="checkScores(' + i + ', ' + j + ')" style="width: 50px" value="' + rounds[i][j].top.score + '">' : ((i < 4) ? ' - ' + rounds[i][j].top.score : '')) + '</li>';
            html += '<li class="game game-spacer-left">&nbsp;</li>';
            html += '<li class="game game-bottom' + ((rounds[i][j].winner === 'bottom') ? ' winner' : '');
            html += '">' + rounds[i][j].bottom.name + ((i === 4) ? ' <input type="number" id="score' + i + '_' + j + 'bottom" oninput="checkScores(' + i + ', ' + j + ')" style="width: 50px" value="' + rounds[i][j].bottom.score + '">' : ((i < 4) ? ' - ' + rounds[i][j].bottom.score : '')) + '</li>';
            html += '<li class="spacer">&nbsp;</li>';
        }
        html += '</ul>';
        $('#tournament').append(html);
    }
    
    html = '<ul class="round"><li class="spacer">&nbsp;</li></ul>';
     $('#tournament').append(html);
    
    for (var i = 3; i > 0; i--){
        var html = '<ul class="round round-' + i + '"><li class="spacer">&nbsp;</li>';
        for (var j = (rounds[i].length / 2); j < rounds[i].length; j++){
            html += '<li class="game game-top' + ((rounds[i][j].winner === 'top') ? ' winner' : '');
            html += '">' + rounds[i][j].top.name + ((i === 4) ? ' <input type="number" id="score' + i + '_' + j + 'top" oninput="checkScores(' + i + ', ' + j + ')" style="width: 50px" value="' + rounds[i][j].top.score + '">' : ((i < 4) ? ' - ' + rounds[i][j].top.score : '')) + '</li>';
            html += '<li class="game game-spacer-right">&nbsp;</li>';
            html += '<li class="game game-bottom' + ((rounds[i][j].winner === 'bottom') ? ' winner' : '');
            html += '">' + rounds[i][j].bottom.name + ((i === 4) ? ' <input type="number" id="score' + i + '_' + j + 'bottom" oninput="checkScores(' + i + ', ' + j + ')" style="width: 50px" value="' + rounds[i][j].bottom.score + '">' : ((i < 4) ? ' - ' + rounds[i][j].bottom.score : '')) + '</li>';
            html += '<li class="spacer">&nbsp;</li>';
        }
        html += '</ul>';
        $('#tournament').append(html);
    }

    html = '<ul class="round round-4">';
    html += '<li class="spacer">&nbsp;</li>';
    html += '<li class="game game-top' + ((rounds[4][0].winner === 'top') ? ' winner' : '') + '">' + rounds[4][0].top.name + '<input type="number" id="score' + 4 + '_' + 0 + 'top" oninput="checkScores(' + 4 + ', ' + 0 + ')" style="width: 50px" value="' + rounds[4][0].top.score + '"></li>';
    html += '<li class="game game-spacer-left">&nbsp;</li>';
    html += '<li class="game game-bottom' + ((rounds[4][0].winner === 'bottom') ? ' winner' : '') + '">' + rounds[4][0].bottom.name + '<input type="number" id="score' + 4 + '_' + 0 + 'bottom" oninput="checkScores(' + 4 + ', ' + 0 + ')" style="width: 50px" value="' + rounds[4][0].bottom.score + '"></li>';
    html += '<li class="spacer">&nbsp;</li>';
    html += '</ul>';
    $('#finals').append(html);

    html = '<ul class="round">';
    html += '<li class="game game-top">First Place</li>';
    html += '</ul>';
    $('#finals').append(html);

    html = '<ul class="round"><li class="spacer">&nbsp;</li></ul>';
    $('#finals').append(html);

    html = '<ul class="round">';
    html += '<li class="game game-top">Third Place</li>';
    html += '</ul>';
    $('#finals').append(html);

    html = '<ul class="round round-4">';
    html += '<li class="spacer">&nbsp;</li>';
    html += '<li class="game game-top' + ((rounds[4][1].winner === 'top') ? ' winner' : '') + '">' + rounds[4][1].top.name + '<input type="number" id="score' + 4 + '_' + 1 + 'top" oninput="checkScores(' + 4 + ', ' + 1 + ')" style="width: 50px" value="' + rounds[4][1].top.score + '"></li>';
    html += '<li class="game game-spacer-right">&nbsp;</li>';
    html += '<li class="game game-bottom' + ((rounds[4][1].winner === 'bottom') ? ' winner' : '') + '">' + rounds[4][1].bottom.name + '<input type="number" id="score' + 4 + '_' + 1 + 'bottom" oninput="checkScores(' + 4 + ', ' + 1 + ')" style="width: 50px" value="' + rounds[4][1].bottom.score + '"></li>';
    html += '<li class="spacer">&nbsp;</li>';
    html += '</ul>';
    $('#finals').append(html);
};

function checkScores(round, match){
    var topID = '#score' + round + '_' + match + 'top';
    var bottomID = '#score' + round + '_' + match + 'bottom';
    var topScore = parseInt($(topID).val());
    rounds[round][match].top.score = topScore;
    var bottomScore = parseInt($(bottomID).val());
    rounds[round][match].bottom.score = bottomScore;
    if (topScore > bottomScore)
        winner = 'top';
    else if (topScore < bottomScore)
        winner = 'bottom';
    else   
        winner = null;

    rounds[round][match].winner = winner;

    if (winner !== null){
        $.ajax({
            type: 'POST',
            url: '/saveKnockoutPick',
            data: {
                matchId: match,
                roundId: round,
                winner: rounds[round][match][winner].id,
                team1_score: rounds[round][match].top.score,
                team2_score: rounds[round][match].bottom.score
            },
            success: function(response){
                var response = JSON.parse(response);
                if (response.error) {
                    window.alert(response.error);
                    location.reload();
                }
                if (round < 4)
                    refreshRound(round + 1);
                else                                
                    refreshHTML();
            }
        });
    }
    else {
        if (round < 4)
            refreshRound(round + 1);
        else
            refreshHTML();
    }
}