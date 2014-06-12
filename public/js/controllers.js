'use strict';

/* Controllers */

function AppCtrl($scope, socket) {

  // Socket listeners
  // ================

  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
    $scope.room = data.room;
  });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);
  });

  socket.on('change:name', function (data) {
    changeName(data.oldName, data.newName);
  });

  socket.on('change:room', function (data) {
    changeRoom(data.oldName, data.newRoom);
  });

  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users.push({name: data.name, room: 'Lobby'});
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has left.'
    });
    var i, user;
    for (i = 0; i < $scope.users.length; i++) {
      user = $scope.users[i];
      if (user.name === data.name) {
        $scope.users.splice(i, 1);
        break;
      }
    }
  });

  // Private helpers
  // ===============

  var changeName = function (oldName, newName) {
    // rename user in list of users
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i].name === oldName) {
        $scope.users[i].name = newName;
      }
    }

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + ' is now known as ' + newName + '.'
    });
  }

  // Private helpers
  // ===============

  var changeRoom = function (oldName, newRoom) {
    // rename user in list of users
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i].name === oldName) {
        $scope.users[i].room = newRoom;
      }
    }

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + ' is now in ' + newRoom + '.'
    });
  }

  // Methods published to the scope
  // ==============================

  $scope.changeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {
        
        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };

  $scope.changeRoom = function () {
    socket.emit('change:room', {
      room: $scope.newRoom
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {
        
        changeRoom($scope.name, $scope.newRoom);

        $scope.room = $scope.newRoom;
        $scope.newRoom = '';
      }
    });
  };

  $scope.messages = [];

  $scope.sendMessage = function () {
    socket.emit('send:message', {
      room: $scope.room,
      message: $scope.message
    });

    // add the message to our model locally
    $scope.messages.push({
      room: $scope.room,
      user: $scope.name,  
      text: $scope.message
    });

    // clear message box
    $scope.message = '';
  };
}
