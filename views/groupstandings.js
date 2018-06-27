$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: '/getGroupStandings',
        success: parseTeams
    });
});

function parseTeams(data){
    var teams = JSON.parse(data);
    var html = '';
    var index = 0;

    for (var i = 0; i < 2; i++){
        html += '<div class="row">';
        for (var j = 0; j < 4; j++){
            index = ((i * 16) + (j * 4));
            html += '<div class="well col-sm-3">';
            html += '<h1>';
            html += '<span class="fa fa-users"></span> ' + teams[index].groupName;
            html += '</h1>';
            html += '<div>';
            for (var k = 0; k < 4; k++){
                index = ((i * 16) + (j * 4) + k);
                html += '<div class="teamRow">';
                html += '<div class="rowLabel">';
                html += '<div class="teamLabel">' + teams[index].name + '</div>';
                html += '</div>';
                html += '<img class="flag" src="../images/' + teams[index].name.replace(' ','') + '.jpg" alt="' + teams[index].name + '.jpg">';
                html += '<div class="extrasBox">';
                html += '<div class="pointsBox">' + teams[index].points + ' pts</div>';
                html += '<div class="statsBox">' + teams[index].wins + 'W ' + teams[index].losses + 'L ' + teams[index].draws + 'D  ' + teams[index].goalsFor + 'GF ' + teams[index].goalsAgainst + 'GA</div>';
                html += '</div></div>';
            }
            html += '</div></div>';
        }
        html += '</div>';
    }
    $('#groupsContainer').append(html);
};
