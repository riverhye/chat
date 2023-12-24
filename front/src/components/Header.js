import useToggle from '../hooks/UseToggle';
import '../styles/chat.css';

export default function Header({ setDmTo, userListOptions }) {
  const [toggle, setToggle] = useToggle(false);

  return (
    <>
      <div className="chat-header">
        <span className="greeting">chat chat</span>
        <div className="toggle-button" onClick={setToggle}>
          &#926;
        </div>
        {toggle && (
          <ul className="input__select-dm">
            <span>채팅 참여자</span>
            <li onClick={() => setDmTo('all')}>전체</li>
            {userListOptions}
          </ul>
        )}
      </div>
    </>
  );
}
