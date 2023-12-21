import { useCallback, useMemo, useEffect, useState } from 'react';
import '../styles/chat.css';
import Chat from './Chat';
import Notice from './Notice';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:8000', { autoConnect: false });

export default function Chatting() {
  const [msgInput, setMsgInput] = useState('');
  const [chatList, setChatList] = useState([]);
  const [userIdInput, setUserIdInput] = useState('');
  const [userId, setUserId] = useState(null);
  const [failMsg, setFailMsg] = useState('');
  const [userList, setUserList] = useState({});
  const [dmTo, setDmTo] = useState('all');
  const [msgTimeList, setMsgTimeList] = useState([]);

  const initSocketConnect = () => {
    if (!socket.connected) socket.connect();
  };

  // state 변수에 영향 받지 않는 이벤트들
  useEffect(() => {
    socket.on('error', (res) => {
      setFailMsg(res.msg);
    });

    socket.on('entrySuccess', (res) => {
      setUserId(res.userId);
    });

    socket.on('userList', (res) => {
      setUserList(res);
    });
  }, []);

  // DM을 위한 userList 작성 : 배열은 JSX에서 그대로 나열된다는 점 활용
  const userListOptions = useMemo(() => {
    const options = [];
    for (const key in userList) {
      // 유저 본인은 목록에서 제외
      if (userList[key] === userId) continue;
      options.push(
        <option key={key} value={key}>
          {userList[key]}
        </option>
      );
    }

    return options;
  }, [userList]);

  // chat : 새로운 채팅 내용
  const addChatList = useCallback(
    (res) => {
      const type = res.userId === userId ? 'my' : 'other';
      const content = `${res.dm ? '(속닥속닥)' : ''} ${res.msg}`;
      const timestamp = res.timestamp;

      // TODO : 연속해서 같은 유저가 메시지 입력 시 닉네임 생략
      // userList(obj)가 1개 이상일 때, chatList의 마지막 key의 value가 res.userId와 같으면
      // isMychat = true 아니면 false

      const newChatList = [
        ...chatList,
        {
          type: type,
          content: content,
          userId: type === 'my' ? '' : res.userId,
          // timestamp:
        },
      ];
      setChatList(newChatList);
    },
    [userId, chatList]
  );

  // msg time 전달하기
  const getMsgTime = useMemo(() => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    const msgTime = `${hours < 10 ? '0' : ''}${hours}:${
      minutes < 10 ? '0' : ''
    }${minutes}`;

    return msgTime;
  }, [addChatList]);

  useEffect(() => {
    socket.on('chat', addChatList);
    socket.emit('msgTime', getMsgTime);

    return () => {
      socket.off('chat', addChatList);
      socket.off('msgTime', getMsgTime);
    };
  }, [addChatList]);

  // notice : 입퇴장 알리기
  useEffect(() => {
    const notice = (res) => {
      const newChatList = [...chatList, { type: 'notice', content: res.msg }];
      setChatList(newChatList);
    };

    socket.on('notice', notice);

    return () => socket.off('notice', notice);
  }, [chatList, userIdInput]);

  // sendMsg : 메시지 전송
  const sendMsg = () => {
    if (msgInput !== '') {
      setMsgInput('');
      const newMsgTime = [...msgTimeList, getMsgTime];
      setMsgTimeList(newMsgTime);
      socket.emit('sendMsg', {
        userId: userId,
        msg: msgInput,
        dm: dmTo,
        timestamp: msgTimeList,
      });
    } else {
      // 전송할 메시지를 입력해 주세요.
    }
  };

  // entry : 닉네임 입력
  const entryChat = () => {
    initSocketConnect();
    socket.emit('entry', { userId: userIdInput });
  };

  // Enter 누르면 button onClick과 동일
  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      userId ? sendMsg() : entryChat();
    }
  };

  return (
    <div className="wrapper-container">
      <div className="greeting">
        {' '}
        {userId ? `Hello, ${userId}!` : 'Chat Chat'}
      </div>

      {userId ? (
        <>
          <div className="chat-wrapper">
            <div className="chat-container">
              {chatList.map((chat, i) => {
                if (chat.type === 'notice') return <Notice chat={chat} i={i} />;
                else
                  return (
                    <Chat msgTimeList={msgTimeList} chat={chat} i={i} />
                    // {msgTimeList.map((msgTime, i) => (
                    //   <ChatTime msgTime={msgTime} />
                    // ))}
                  );
              })}
            </div>
            <div className="input-container">
              <select
                className="input__select-dm"
                value={dmTo}
                onChange={(e) => setDmTo(e.target.value)}
              >
                <option value="all">전체</option>
                {userListOptions}
              </select>
              <input
                className="input-basic"
                type="text"
                value={msgInput}
                placeholder="메시지를 입력하세요."
                onKeyDown={handleEnter}
                onChange={(e) => setMsgInput(e.target.value)}
              />
              <button className="input__button" onClick={sendMsg}>
                ✉︀
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="entry-container">
          <div className="input-wrapper">
            <div className="nickname-container">
              <input
                className="input-basic"
                type="text"
                placeholder="사용할 닉네임을 입력하세요."
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                onKeyDown={handleEnter}
              />
              <button className="input__button" onClick={entryChat}>
                🖐️
              </button>
            </div>
            <div>{failMsg}</div>
          </div>
        </div>
      )}
    </div>
  );
}
