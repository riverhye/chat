import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import useToggle from '../hooks/UseToggle';
import '../styles/chat.css';
import Chat from './Chat';
import Notice from './Notice';
import Header from './Header';
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
  const [toggle, setToggle] = useToggle(false);

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
      options.push(
        <div key={key}>
          {userList[key] === userId
            ? `(나) ${userList[key]}`
            : `⚪ ${userList[key]}`}
        </div>
      );
    }

    return options;
  }, [userList]);

  // chat : 새로운 채팅 내용
  const addChatList = useCallback(
    (res) => {
      const type = res.userId === userId || !userId ? 'my' : 'other';

      // TODO : 연속해서 같은 유저가 메시지 입력 시 닉네임 생략
      // timestamp와 type이 이전과 같으면, 이전의 timestamp을 ''으로 만들고 마지막 것만 남기기

      const newChatList = [
        ...chatList,
        {
          type: type,
          content: res.msg,
          userId: type === 'my' ? '' : res.userId,
          timestamp: res.timestamp,
          dm: res.dm,
        },
      ];
      setChatList(newChatList);
    },
    [chatList]
  );

  useEffect(() => {
    socket.on('chat', addChatList);

    return () => {
      socket.off('chat', addChatList);
    };
  }, [addChatList]);

  // sendMsg : 메시지 전송
  const sendMsg = () => {
    if (msgInput !== '') {
      const timestamp = getMsgTime();
      socket.emit('sendMsg', {
        userId: userId,
        msg: msgInput,
        dm: dmTo,
        timestamp: timestamp,
      });
      setMsgInput('');
    } else {
      console.log('write down a message');
    }
  };

  // msg time 전달하기
  const getMsgTime = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    const msgTime = `${hours < 10 ? '0' : ''}${hours}:${
      minutes < 10 ? '0' : ''
    }${minutes}`;

    return msgTime;
  };

  // notice : 입퇴장 알리기
  useEffect(() => {
    const notice = (res) => {
      const newChatList = [...chatList, { type: 'notice', content: res.msg }];
      setChatList(newChatList);
    };

    socket.on('notice', notice);

    return () => socket.off('notice', notice);
  }, [chatList, userIdInput]);

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

  // TODO : 두번째 메세지부터 textarea 자동 개행 문제
  const textareaRef = useRef();

  const resizeHeight = () => {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  return (
    <div className="wrapper-container">
      {/* <div className="greeting">
        {' '}
        {userId ? `Hello, ${userId}!` : 'Chat Chat'}
      </div> */}

      {userId ? (
        <>
          <div className="chat-wrapper">
            <div>
              <Header setDmTo={setDmTo} userListOptions={userListOptions} />
              <div className="chat-container">
                {chatList.map((chat, i) => {
                  if (chat.type === 'notice')
                    return <Notice chat={chat} i={i} />;
                  else return <Chat chat={chat} i={i} />;
                })}
              </div>
              <div className="input-container">
                <textarea
                  ref={textareaRef}
                  className="input-msg input-basic"
                  value={msgInput}
                  placeholder="메시지를 입력하세요."
                  onKeyDown={handleEnter}
                  onChange={(e) => {
                    setMsgInput(e.target.value);
                    resizeHeight();
                  }}
                  rows={1}
                />
                <button
                  className={`input__button ${
                    msgInput === '' ? 'disabled' : ''
                  }`}
                  onClick={sendMsg}
                  disabled={msgInput === ''}
                >
                  ✉︀
                </button>
              </div>
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
