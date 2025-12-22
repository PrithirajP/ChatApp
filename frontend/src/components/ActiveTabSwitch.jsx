import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    // 1. Added 'w-full' here to ensure the container stretches
    <div className="tabs tabs-boxed w-full bg-transparent p-2 m-2 flex"> 
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab flex-1 transition-colors ${ // 2. Added 'flex-1' here
          activeTab === "chats"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab flex-1 transition-colors ${ // 3. Added 'flex-1' here
          activeTab === "contacts"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;