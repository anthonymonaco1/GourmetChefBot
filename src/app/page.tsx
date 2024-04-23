import ChatBox from "./components/chat/ChatBox";
import Header from "./components/generics/Header";

export default function Home() {
  return (
    <main className="flex flex-col h-screen min-w-screen bg-gray-200 overflow-hidden">
      <Header />
      <ChatBox />
    </main>
  );
}
