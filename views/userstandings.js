$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: '/getUserStandings',
        success: parseUsers
    });
});

function parseUsers(data){
    var users = JSON.parse(data);
    var html = '';
    html += '<div class="row">';
    html += '<div class="well">';
    html += '<div>'
    for (var i = 0; i < users.length; i++){
        html += '<div class="userRow well">';
        html += '<div class="placeBox">' + (i+1) + ((i === 0) ? 'st' : ((i === 1) ? 'nd' : ((i === 2) ? 'rd' : 'th'))) + '</div>';
        html += '<div class="nameBox ' + ((users[i].paid === 1) ? 'paid' : 'notPaid') + '">' + users[i].name + '</div>';
        html += '<div class="pointsBox">' + users[i].points + ' points</div>';
        html += '</div>';
    }
    html += '</div></div></div>';
    $('#usersContainer').append(html);
};
