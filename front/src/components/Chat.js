export default function Chat({ chat, i }) {
  return (
    <>
      <div key={i} className={`list ${chat.type}-chat`}>
        {chat.type !== 'my' && (
          <div className="chat-nickname">{chat.userId}</div>
        )}
        <div className="content">{chat.content}</div>
        <div className="chat-time">{chat.timestamp}</div>
      </div>
    </>
  );
}
