const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const PORT = 8000;

const cors = require('cors');
app.use(cors());

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    // method: ['GET', 'POST'],
  },
});

let userIdArr = {};

// DM 하려면 채팅 접속자가 필요해서
// 보안상 socket.id는 제외하는 게 좋지만, 편의상 한꺼번에 보냄
const updateUserList = () => {
  io.emit('userList', userIdArr);
};

io.on('connection', (socket) => {
  console.log('socket id', socket.id);

  socket.on('entry', (res) => {
    if (Object.values(userIdArr).includes(res.userId)) {
      socket.emit('error', { msg: '중복된 닉네임입니다.' });
    } else {
      io.emit('notice', { msg: `${res.userId}님이 입장했습니다.` });
      socket.emit('entrySuccess', { userId: res.userId });
      userIdArr[socket.id] = res.userId;
      updateUserList();
    }
  });

  socket.on('disconnect', () => {
    io.emit('notice', { msg: `${userIdArr[socket.id]}님이 퇴장했습니다.` });
    delete userIdArr[socket.id];
    updateUserList();
  });

  socket.on('sendMsg', (res) => {
    if (res.dm === 'all')
      io.emit('chat', {
        userId: res.userId,
        msg: res.msg,
        timestamp: res.msgTimeList,
      });
    else {
      // 나에게 보내기 : socket.emit()
      // 특정인에게 보내기 : io.to(소켓 아이디).emit()
      // 모두에게 보내기 : io.emit()
      // ----- 같은 부분 변수화하는 게 좋다 -----
      io.to(res.dm).emit('chat', {
        userId: res.userId,
        msg: res.msg,
        dm: true,
      });
      socket.emit('chat', {
        userId: res.userId,
        msg: res.msg,
        dm: true,
        timestamp: res.msgTimeList,
      });
    }
  });

  socket.on('msgTime', (res) => {
    console.log('res', res);
  });
});

server.listen(PORT, function (req, res) {
  console.log(`Server Open : ${PORT}`);
});
