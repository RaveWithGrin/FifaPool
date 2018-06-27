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
    html += '<div class="well"><form action="/updatePaid" method="post">';
    html += '<div>'
    for (var i = 0; i < users.length; i++){
        html += '<div class="userRow well">';
        html += '<div class="nameBox">' + users[i].name + '(' + users[i].email + ')</div>';
        html += '<div class="paidBox"><input type="checkbox" name="paid" value="' + users[i].name + '" ' + ((users[i].paid === 1) ? 'checked': '') + '>Paid</div>';
        html += '</div>';
    }
    html += '</div><input type="submit" value="Submit"></form></div></div>';
    $('#usersContainer').append(html);
};
