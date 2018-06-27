var database = require('./config/database');
var mysql = require('promise-mysql');
var request = require('request-promise');

var schedule;

var getScores = async function(){
    var result = JSON.parse(await request('https://api.fifa.com/api/v1/calendar/matches?idseason=254645&idcompetition=17&language=en-GB&count=100'));
    result = result.Results;
    var parsedGames = []
    result.forEach(function(match){
        if (match.MatchStatus === 0){
            var game = {};
            game.home = {
                team: match.Home.TeamName[0].Description,
                goals: match.HomeTeamScore
            };
            game.away = {
                team: match.Away.TeamName[0].Description,
                goals: match.AwayTeamScore
            };
            parsedGames.push(game);
        }
    });
    return parsedGames;
};

var updateSchedule = async function(){
    var gamesPlayed = await getScores();
    gamesPlayed.forEach(async function(match){
        var connection = await mysql.createConnection(database.connection);
        var sql = "UPDATE schedule sc JOIN teams t1 ON t1.id = sc.team1 JOIN teams t2 ON t2.id = sc.team2 SET sc.team1Goals = " + match.home.goals + ", sc.team2Goals = " + match.away.goals + ", sc.played = 1, sc.winner = " + ((match.home.goals > match.away.goals) ? 't1.id' : (match.home.goals < match.away.goals) ? 't2.id' : 0) + " WHERE t1.name = '" + match.home.team + "' AND t2.name = '" + match.away.team + "'";
        await connection.query(sql);
        connection.end();
    });
};

var updateGroups = async function(){
    for (var i = 1; i < 33; i++){
        var connection = await mysql.createConnection(database.connection);
        var homeGames = await connection.query('SELECT sc.winner, sc.team1Goals, sc.team2Goals FROM schedule sc WHERE sc.team1 = ' + i + ' AND sc.played = 1');
        var awayGames = await connection.query('SELECT sc.winner, sc.team1Goals, sc.team2Goals FROM schedule sc WHERE sc.team2 = ' + i + ' AND sc.played = 1');
        var wins, losses, draws, points, goalsFor, goalsAgainst;
        wins = losses = draws = points = goalsFor = goalsAgainst = 0;
        homeGames.forEach(function(game){
            if (game.winner === i){
                wins += 1;
                points += 3;
            } else if (game.winner === 0){
                draws += 1;
                points += 1;
            } else {
                losses += 1;
            }
            goalsFor += game.team1Goals;
            goalsAgainst += game.team2Goals;
        });
        awayGames.forEach(function(game){
            if (game.winner === i){
                wins += 1;
                points += 3;
            } else if (game.winner === 0){
                draws += 1;
                points += 1;
            } else {
                losses += 1;
            }
            goalsFor += game.team2Goals;
            goalsAgainst += game.team1Goals;
        });
        await connection.query('UPDATE groups SET wins = ?, losses = ?, draws = ?, points = ?, goalsFor = ?, goalsAgainst = ? WHERE teamID = ?', [wins, losses, draws, points, goalsFor, goalsAgainst, i]);
        connection.end();
    }
};

var updatePosition = async function(){
    var connection = await mysql.createConnection(database.connection);
    schedule = await connection.query('SELECT * FROM schedule');
    var unsortedGroups = await connection.query('SELECT * FROM groups ORDER BY id, position');
    for (var i = 0; i < unsortedGroups.length; i+=4){
        var group = [];
        for (var j = i; j < (i + 4); j++){
            var team = JSON.parse(JSON.stringify(unsortedGroups[j]));
            group.push(team);
        }
        group.sort(orderGroups);
        for (var j = 0; j < group.length; j++){
            await connection.query('UPDATE groups SET position = ? WHERE teamID = ?', [(j + 1), group[j].teamID]);
        }
    }
    connection.end();
};

var orderGroups = function(a,b){
    if (a.points > b.points) return -1;
    else if (a.points < b.points) return 1;
    else if ((a.goalsFor - a.goalsAgainst) > (b.goalsFor - b.goalsAgainst)) return -1;
    else if ((a.goalsFor - a.goalsAgainst) < (b.goalsFor - b.goalsAgainst)) return 1;
    else if (a.goalsFor > b.goalsFor) return -1;
    else if (a.goalsFor < b.goalsFor) return 1;
    else {
        for (var i = 0; i < schedule.length; i++){
            if ((schedule[i].team1 === a.teamID) && (schedule[i].team2 === b.teamID)){
                if (schedule[i].winner === a.teamID) return -1;
                else if (schedule[i].winner === b.teamID) return 1;
                else return 0;
            }
        }
		return 0;
    }
};


var main = async function(){
    await updateSchedule();
    await updateGroups();
    await updatePosition();
};

process.on('unhandledRejection', function(error){
    console.error(error);
    process.exit(1);
});

module.exports = {
    update: main
};
