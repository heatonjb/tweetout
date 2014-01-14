window.onload = function()
{
    var socket = io.connect('http://localhost:9000');
    socket.on('update', function(data) {
        var time = data.minutes + 'm ' + data.seconds + 's';
        document.querySelector('.time').innerHTML = time;
    });
}
