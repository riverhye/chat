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

  const initSocketConnect = () => {
    if (!socket.connected) socket.connect();
  };

  // 응답만 받고 특정 변수를 사용 안 하면 -> mount
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

  // 값을 return 하므로 useMemo
  // useMemo : 의존성 배열의 값이 update 될 때마다 콜백함수 연산한 값 저장
  const userListOptions = useMemo(() => {
    const options = [];
    for (const key in userList) {
      // key: userList의 key (socket.id), value : userList[key] (userId)
      // 나는 select 목록에서 제외
      if (userList[key] === userId) continue;
      options.push(
        <option key={key} value={key}>
          {userList[key]}
        </option>
      );
    }

    return options;
  }, [userList]);

  // 메시지 전송 기능
  // userId에 따라 type이 바뀌고, type으로 chatList가 새로 생성
  // useCallback : 의존성 배열의 값이 update 될 때만 함수 재선언 (else 기존 함수 사용)
  const addChatList = useCallback(
    (res) => {
      const type = res.userId === userId ? 'my' : 'other';

      const content = `${res.dm ? '(속닥속닥)' : ''} ${
        type === 'my' ? res.msg : res.userId + ': ' + res.msg
      }`;

      const newChatList = [...chatList, { type: type, content: content }];
      setChatList(newChatList);
    },
    [userId, chatList]
  );

  useEffect(() => {
    socket.on('chat', addChatList);

    return () => socket.off('chat', addChatList);
  }, [addChatList]);

  // notice로 입퇴장 알리기
  useEffect(() => {
    const notice = (res) => {
      const newChatList = [...chatList, { type: 'notice', content: res.msg }];
      setChatList(newChatList);
    };

    socket.on('notice', notice);

    return () => socket.off('notice', notice);
  }, [chatList, userIdInput]);

  const sendMsg = () => {
    if (msgInput !== '') {
      socket.emit('sendMsg', { userId: userId, msg: msgInput, dm: dmTo });
      setMsgInput('');
    }
  };

  const entryChat = () => {
    initSocketConnect();
    socket.emit('entry', { userId: userIdInput });
  };

  return (
    <div className="wrapper-container">
      {userId ? (
        <>
          <div className="greeting">Hello, {userId}!</div>
          <div className="chat-wrapper">
            <div className="chat-container">
              {chatList.map((chat, i) => {
                if (chat.type === 'notice') return <Notice chat={chat} />;
                else return <Chat chat={chat} i={i} />;
              })}
            </div>
            <div className="input-container">
              <select value={dmTo} onChange={(e) => setDmTo(e.target.value)}>
                <option value="all">전체</option>
                {userListOptions}
              </select>
              <input
                type="text"
                value={msgInput}
                placeholder="메시지를 입력하세요."
                onChange={(e) => setMsgInput(e.target.value)}
              />
              <button className="input-button" onClick={sendMsg}>
                ✉︀
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="entry-container">
          <div className="input-wrapper">
            <div className="input-container">
              <input
                type="text"
                placeholder="사용할 닉네임을 입력하세요."
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
              />
              <button className="input-button" onClick={entryChat}>
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
