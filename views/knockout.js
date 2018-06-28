var rounds = {
    1: [],
    2: [],
    3: [],
    4: []
};

$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: '/getFirstRoundTeams',
        success: parseTeams
    });
});

function parseTeams(raw){
    var data = JSON.parse(raw);
    for (var i = 0; i < data.length; i+=4){
        rounds[1].push({
            top: {
                id: data[i].teamID,
                name: data[i].name,
                score: 0
            },
            bottom: {
                id: data[i+3].teamID,
                name: data[i+3].name,
                score: 0
            },
            winner: null
        });
    }
    for (var i = 1; i < (data.length + 1); i+=4){
        rounds[1].push({
            top: {
                id: data[i].teamID,
                name: data[i].name,
                score: 0
            },
            bottom: {
                id: data[i+1].teamID,
                name: data[i+1].name,
                score: 0
            },
            winner: null
        });
    }
    for (var i = 2; i < 5; i++){
        for (var j = 0; j < Math.pow(2, (4-i)); j++){
            rounds[i].push({
                top: {
                    id: 0,
                    name: 'TBD',
                    score: 0
                },
                bottom: {
                    id: 0,
                    name: 'TBD',
                    score: 0
                },
                winner: null
            });
        }
    }
    $.ajax({
        type: 'GET',
        url: '/getKnockoutPicks',
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
    });
    refreshRound(2);
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
    for (var i = 1; i < 4; i ++){
        var html = '<ul class="round round-' + i + '"><li class="spacer">&nbsp;</li>';
        for (var j = 0; j < (rounds[i].length / 2); j++){
            html += '<li class="game game-top' + ((rounds[i][j].winner === 'top') ? ' winner' : '');
            html += '" ' + ((i === 1) ? 'onclick="toggleWinner(' + i + ', ' + j + ', ' + '\'top\')"' : '') + '>' + rounds[i][j].top.name  + '</li>';
            html += '<li class="game game-spacer-left">&nbsp;</li>';
            html += '<li class="game game-bottom' + ((rounds[i][j].winner === 'bottom') ? ' winner' : '');
            html += '" ' + ((i === 1) ? 'onclick="toggleWinner(' + i + ', ' + j + ', ' + '\'bottom\')"' : '') + '>' + rounds[i][j].bottom.name + '</li>';
            html += '<li class="spacer">&nbsp;</li>';
        }
        html += '</ul>';
        $('#tournament').append(html);
    }
    
    html = '<ul class="round round-4"><li class="spacer">&nbsp;</li><li class="game game-top' + ((rounds[4][0].winner === 'top') ? ' winner' : '');
    html += '">' + rounds[4][0].top.name + '</li>';
    html += '<li class="game game-spacer">&nbsp;</li><li class="game game-bottom' + ((rounds[4][0].winner === 'bottom') ? ' winner' : '');
    html += '">' + rounds[4][0].bottom.name + '</li>';
    html += '<li class="spacer">&nbsp;</li></ul>';
    $('#tournament').append(html);
    
    for (var i = 3; i > 0; i--){
        var html = '<ul class="round round-' + i + '"><li class="spacer">&nbsp;</li>';
        for (var j = (rounds[i].length / 2); j < rounds[i].length; j++){
            html += '<li class="game game-top' + ((rounds[i][j].winner === 'top') ? ' winner' : '');
            html += '" ' + ((i === 1) ? 'onclick="toggleWinner(' + i + ', ' + j + ', ' + '\'top\')"' : '') + '>' + rounds[i][j].top.name  + '</li>';
            html += '<li class="game game-spacer-right">&nbsp;</li>';
            html += '<li class="game game-bottom' + ((rounds[i][j].winner === 'bottom') ? ' winner' : '');
            html += '" ' + ((i === 1) ? 'onclick="toggleWinner(' + i + ', ' + j + ', ' + '\'bottom\')"' : '') + '>' + rounds[i][j].bottom.name + '</li>';
            html += '<li class="spacer">&nbsp;</li>';
        }
        html += '</ul>';
        $('#tournament').append(html);
    }
};

function toggleWinner(round, match, winner){
    rounds[round][match].winner = winner;
    var data = {
        matchId: match,
        roundId: round,
        winner: rounds[round][match][winner].id
    };
    $.ajax({
        type: 'POST',
        url: '/saveKnockoutPick',
        data: {
            matchId: match,
            roundId: round,
            winner: rounds[round][match][winner].id
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