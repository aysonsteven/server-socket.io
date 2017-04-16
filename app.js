const express = require('express');
const app = express();
const http = require('http').Server(app);
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 5000;

const host = "localhost";

server.listen(port, host,  ()=> {
  console.log('started on port 5000');
});
let numUsers = 0;

io.on('connection', (socket) => {
  let addedUser = false;
  console.log('user connected');

  // when the client emits 'new message', this listens and executes
  socket.on('add-message',  (data) => {
    
    // we tell the client to execute 'new message'
    socket.broadcast.emit('add-message', {
      username: data.username,
      message: data.message
    });
  });

  socket.on('add user', function (username) {
    console.log(username);
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    io.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });


  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });

    // console.log('typing', username);
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });


  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
      console.log( 'left', username );
    }
  });

});

// http.listen(5000, () => {
//   console.log('started on port 5000');
// });