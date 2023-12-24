export default function Chat({ chat, i }) {
  return (
    <>
      <div key={i} className={`list ${chat.type}-chat`}>
        {chat.type !== 'my' ? (
          <>
            <div className="chat-nickname">{chat.userId}</div>
            <div className="content">
              {chat.dm && <span>(DM) </span>}
              {chat.content}
            </div>
            <span className="chat-time">{chat.timestamp}</span>
          </>
        ) : (
          <>
            <span className="chat-time">{chat.timestamp}</span>
            <div className="content">
              {chat.dm && <span>(DM) </span>}
              {chat.content}
            </div>
          </>
        )}
      </div>
    </>
  );
}
