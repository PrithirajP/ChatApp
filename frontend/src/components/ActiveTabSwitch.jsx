import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();
  const { pendingRequests } = useFriendStore();

  return (
    <div className="tabs tabs-boxed w-full bg-transparent p-2 m-2 flex">
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab flex-1 transition-colors ${
          activeTab === "chats"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab flex-1 transition-colors ${
          activeTab === "contacts"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Contacts
      </button>

      <button
        onClick={() => setActiveTab("requests")}
        className={`tab flex-1 transition-colors relative ${
          activeTab === "requests"
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Requests
        {/* Badge showing count of pending requests */}
        {pendingRequests.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full size-4 flex items-center justify-center">
            {pendingRequests.length}
          </span>
        )}
      </button>
    </div>
  );
}

export default ActiveTabSwitch;