var database = require('./config/database');
var mysql = require('promise-mysql');
var bcrypt = require('bcrypt-nodejs');

var runQuery = async function (sql, options) {
    var connection = await mysql.createConnection(database.connection);
    try {
        var query = await connection.query(sql, options);
        return ({ error: null, data: query });
    } catch (error) {
        console.log(error);
        return ({ error: error, data: null });
    } finally {
        connection.end();
    }
};

var get = {
    userByEmail: async function (email) {
        return await runQuery('SELECT * FROM users WHERE email = ?', [email]);
    },
    userByID: async function (id) {
        return await runQuery('SELECT * FROM users WHERE id = ?', [id]);
    },
    groupPicks: async function (user) {
        return await runQuery('SELECT gp.groupId AS `group`, gp.firstTeam AS `first`, gp.secondTeam AS `second`, gp.thirdTeam AS `third`, gp.fourthTeam AS `fourth` FROM group_picks gp WHERE gp.userId = ?', [user.id]);
    },
    teams: async function () {
        return await runQuery('SELECT t.id AS teamId, t.name AS teamName, g.id AS groupId, g.groupName AS groupName FROM teams t JOIN groups g ON g.teamId = t.id', null);
    },
    groupPercentages: async function () {
        return await runQuery('SELECT COUNT(*) AS samePick, np.numPicks, gp.groupId AS groupId, gp.firstTeam AS pick, 1 AS place FROM group_picks gp JOIN (SELECT COUNT(*) AS numPicks, gp.groupId FROM group_picks gp GROUP BY gp.groupId ) AS np ON np.groupId = gp.groupId GROUP BY gp.firstTeam UNION SELECT COUNT(*) AS samePick, np.numPicks, gp.groupId AS groupId, gp.secondTeam AS pick, 2 AS place FROM group_picks gp JOIN (SELECT COUNT(*) AS numPicks, gp.groupId FROM group_picks gp GROUP BY gp.groupId ) AS np ON np.groupId = gp.groupId GROUP BY gp.secondTeam UNION SELECT COUNT(*) AS samePick, np.numPicks, gp.groupId AS groupId, gp.thirdTeam AS pick, 3 AS place FROM group_picks gp JOIN (SELECT COUNT(*) AS numPicks, gp.groupId FROM group_picks gp GROUP BY gp.groupId ) AS np ON np.groupId = gp.groupId GROUP BY gp.thirdTeam UNION SELECT COUNT(*) AS samePick, np.numPicks, gp.groupId AS groupId, gp.fourthTeam AS pick, 4 AS place FROM group_picks gp JOIN (SELECT COUNT(*) AS numPicks, gp.groupId FROM group_picks gp GROUP BY gp.groupId ) AS np ON np.groupId = gp.groupId GROUP BY gp.fourthTeam', null);        
    },
    predictedKnockouts: async function (user) {
        return await runQuery('SELECT gp.groupId AS `group`, gp.firstTeam AS `first`, t1.name AS firstName, gp.secondTeam AS `second`, t2.name AS secondName FROM group_picks gp JOIN teams t1 ON t1.id = gp.firstTeam JOIN teams t2 ON t2.id = gp.secondTeam WHERE gp.userId = ?', [user.id]);
    },
    roundTeams: async function(round){
        return await runQuery('SELECT t1.id AS team1Id, t1.name AS team1Name, ko.team1Score, t2.id AS team2Id, t2.name AS team2Name, ko.team2Score FROM knockout ko JOIN teams t1 ON t1.id = ko.team1 JOIN teams t2 ON t2.id = ko.team2 WHERE ko.round <= ?', [round])
    },
    schedule: async function () {
        return await runQuery('SELECT s.`timestamp`, t1.id AS team1Id, t1.name AS team1Name, t2.id AS team2Id, t2.name AS team2Name FROM schedule s JOIN teams t1 ON s.team1 = t1.id JOIN teams t2 ON s.team2 = t2.id ORDER BY s.`timestamp`', null);
    },
    groups: async function () {
        return await runQuery('SELECT * FROM groups ORDER BY id, position', null);
    },
    groupStandings: async function () {
        return await runQuery('SELECT te.name, gr.groupName, gr.wins, gr.losses, gr.draws, gr.goalsFor, gr.goalsAgainst, gr.points, gr.position FROM groups gr JOIN teams te ON te.id = gr.teamID ORDER BY gr.id, gr.position', null);
    },
    userStandings: async function () {
        return await runQuery('SELECT us.name, us.points, us.paid FROM users us ORDER BY us.points DESC, us.name', null);
    },
    fullSchedule: async function () {
        return await runQuery('SELECT * FROM schedule', null);
    },
    groupAdvancements: async function () {
        return await runQuery('SELECT id, teamID, position FROM groups WHERE position < 3', null);
    },
    nextGame: async function () {
        return await runQuery('SELECT * FROM schedule WHERE played = 0 ORDER BY timestamp LIMIT 1', null);
    },
    passwords: async function () {
        return await runQuery('SELECT email, password FROM users');
    },
    knockoutPicks: async function(id, round) {
        return await runQuery('SELECT * FROM knockout_picks WHERE userId = ? AND roundId = ?', [id, round]);
    }
};

var save = {
    groupPicks: async function (picks, user) {
        return await runQuery('INSERT INTO group_picks (userId, groupId, firstTeam, secondTeam, thirdTeam, fourthTeam) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE firstTeam = VALUES(firstTeam), secondTeam = VALUES(secondTeam), thirdTeam = VALUES(thirdTeam), fourthTeam = VALUES(fourthTeam)', [user.id, picks.group, picks.teams[0], picks.teams[1], picks.teams[2], picks.teams[3]]);
    },
    user: async function (user) {
        return await runQuery('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [user.email, user.password, user.name]);
    },
    knockoutPick: async function(pick) {
        return await runQuery('INSERT INTO knockout_picks SET ? ON DUPLICATE KEY UPDATE winner = VALUES(winner), team1_score = VALUES(team1_score), team2_score = VALUES(team2_score)', [pick]);
    }
}

var reset = {
    groups: async function () {
        return await runQuery('UPDATE groups SET wins = 0, losses = 0, draws = 0, goalsFor = 0, goalsAgainst = 0, points = 0, position = 1', null);
    },
    schedule: async function () {
        return await runQuery('UPDATE schedule SET winner = 0, team1Goals = 0, team2Goals = 0, played = 0', null);
    }
}

var update = {
    schedule: async function (data) {
        return await runQuery('UPDATE schedule SET winner = ?, team1Goals = ?, team2Goals = ?, played = ? WHERE id = ?', [data.winner, data.team1Goals, data.team2Goals, data.played, data.id]);
    },
    groups: async function (data) {
        return await runQuery('INSERT INTO groups SET ? ON DUPLICATE KEY UPDATE wins = VALUES(wins) + wins, losses = VALUES(losses) + losses, draws = VALUES(draws) + draws, goalsFor = VALUES(goalsFor) + goalsFor, goalsAgainst = VALUES(goalsAgainst) + goalsAgainst, points = VALUES(points) + points', [data]);
    },
    position: async function (data) {
        return await runQuery('UPDATE groups SET position = ? WHERE teamID = ?', [data[1], data[0]]);
    },
    paid: async function (user) {
        return await runQuery('UPDATE users SET paid = 1 WHERE ID = ?', [user.id]);
    },
    password: async function(user) {
        var result = await runQuery('SELECT password FROM users WHERE email = ?', [user.email]);
        if (result.error)
            return result;
        else {
            if (user.secretkey === result.data[0].password) 
                return await runQuery('UPDATE users SET password = ? WHERE email = ?', [bcrypt.hashSync(user.password, null, null), user.email]);
            else
                return ({ error: 'Incorrect secret key', data: null });
        }
    }
}

/*  Generic function
var result = await runQuery('', null);
if (result.error) {
    return ({ error: 'Problem querying database', data: null });
} else {
    return ({ error: null, data: result.data });
}
*/

module.exports = {
    runQuery: runQuery,
    get: get,
    save: save,
    reset: reset,
    update: update
};
