export default function Chat({ chat, i }) {
  return (
    <>
      <div key={i} className={`list ${chat.type}-chat`}>
        <div className="chat-nickname">닉네임</div>
        <div className="content">{chat.content}</div>
      </div>
    </>
  );
}
