export default function Notice({ chat, i }) {
  return (
    <div key={i} className="list notice">
      {chat.content}
    </div>
  );
}
