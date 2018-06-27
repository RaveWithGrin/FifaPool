$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: '/getSchedule',
        success: parseSchedule
    });
});

function parseSchedule(rows){
    var schedule = JSON.parse(rows);
    
    var html = '';
    var prevDate = 0;
    for (var i = 0; i < schedule.length; i++){
        var date = new Date(schedule[i].timestamp);
        var newDate = date.getDate();
        if (newDate !== prevDate) {
            html += '</div><div class="scheduleRow well"><h3>' + date.toDateString() + '</h3>';
        }
        prevDate = newDate;
        html += '<div class="row well"><div class="team" id="match_' + i + '"><img class="flag" src="../images/' + schedule[i].team1Name.replace(' ', '') + '.jpg" alt="' + schedule[i].team1Name + '"></div>';
        html += '<div class="date">' + pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2) + '</div>';
        html += '<div class="team" id="match_' + i + '"><img class="flag" src="../images/' + schedule[i].team2Name.replace(' ', '') + '.jpg" alt="' + schedule[i].team2Name + '"></div></div>';
    }
    html = html.substring(6);

    $('#scheduleContainer').append(html);
};

function pad(num, size) {
    var s = num + '';
    while (s.length < size) 
        s = "0" + s;
    return s;
}
