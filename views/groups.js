/* global Sortable */

var sortables = [];
var sortableConfig = {
    dataIdAttr: 'id',
    animation: 100,
    onEnd: listSorted,
    disabled: true
};

var groupDeadline = new Date(Date.UTC(2018, 5, 14, 12, 0, 0)).getTime();

$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: '/getTeams',
        success: parseTeams
    });
});

function parseTeams(data){
    var teams = JSON.parse(data);
    var html = '';
    var index = 0;
    
    for (var i = 0; i < 2; i++){
        html += '<div class="row" id="groupSelector">';
        for (var j = 0; j < 4; j++){
            index = ((i * 16) + (j * 4));
            html += '<div class="well col-sm-3"><h1><span class="fa fa-users"></span> ' + teams[index].groupName + '</h1><div id="group' + teams[index].groupId + '" class="list-group">';
            for (var k = 0; k < 4; k++){
                index = ((i * 16) + (j * 4) + k);
                html += '<div class="teamRow list-group-item" id="' + teams[index].teamId +'"><div class="rowLabel"><div class="teamLabel">' + teams[index].teamName + '</div><div class="percent" id="percent' + teams[index].teamId + '"></div></div><img class="flag" src="../images/' + teams[index].teamName.replace(' ','') + '.jpg" alt="' + teams[index].teamName + '.jpg"></div>';
            }
            html += '</div></div>';
        }
        html += '</div>';
    }
    $('#groupSelector').remove();
    $('#groupsContainer').append(html);
    $('#groupsContainer').hide();
    
    var el = document.getElementById('group1');
    sortables.push(sortable_a = Sortable.create(el, sortableConfig));
    el = document.getElementById('group2');
    sortables.push(sortable_a = Sortable.create(el, sortableConfig));
    el = document.getElementById('group3');
    sortables.push(sortable_a = Sortable.create(el, sortableConfig));
    el = document.getElementById('group4');
    sortables.push(sortable_a = Sortable.create(el, sortableConfig));
    el = document.getElementById('group5');
    sortables.push(sortable_a = Sortable.create(el, sortableConfig));
    el = document.getElementById('group6');
    sortables.push(sortable_a = Sortable.create(el, sortableConfig));
    el = document.getElementById('group7');
    sortables.push(sortable_a = Sortable.create(el, sortableConfig));
    el = document.getElementById('group8');
    sortables.push(sortable_a = Sortable.create(el, sortableConfig));
    
    $.ajax({
        type: 'GET',
        url: '/getGroupPicks',
        success: function(rows){
            var picks = JSON.parse(rows);
            for (var i = 0; i < picks.length; i++){
                var pick = picks[i];
                var order = [pick.first, pick.second, pick.third, pick.fourth];
                sortables[pick.group - 1].sort(order);
            }
            $('#groupsContainer').show();
            $.ajax({
                type: 'GET',
                url: '/getGroupPercentages',
                success: processPercentages
            });
        }
    });
};

function processPercentages(data){
    var rows = JSON.parse(data);
    for (var i = 0; i < sortables.length; i++){
        var order = sortables[i].toArray();
        for (var j = 0; j < order.length; j++){
            for (var k = 0; k < rows.length; k++){
                if ((rows[k].groupId === (i + 1)) && (rows[k].pick === parseInt(order[j]))){
                    var elementName = '#percent' + rows[k].pick;
                    $(elementName).html(((rows[k].samePick * 100) / rows[k].numPicks).toFixed(2) + '% agree');
                    break;
                }
            }
        }
    }
}

function listSorted(evt){
    var index = (parseInt(evt.from.id.substr(-1)) - 1);
    $.ajax({
        type: 'POST',
        url: '/saveTeams',
        data: {
            group: (index + 1),
            teams: sortables[index].toArray()
        },
        success: function(response){
            var response = JSON.parse(response);
            if (response.error)
                location.reload();
            $.ajax({
                type: 'GET',
                url: '/getGroupPercentages',
                success: processPercentages
            });
        }
    });
};

var countdown = setInterval(function(){
    var now = new Date().getTime();
    var difference = groupDeadline - now;
    var days = Math.floor(difference / (1000 * 60 * 60 * 24));
    var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((difference % (1000 * 60)) / 1000);

    $('#countdown').html(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");
    if (difference < 0){
        $('#countdown').html('LOCKED');
        clearInterval(countdown);
    }
}, 1000);
