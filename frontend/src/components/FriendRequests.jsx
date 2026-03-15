import { useEffect, useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { axiosInstance } from "../lib/axios";
import { UserCheck, UserX, UserPlus, Search, X } from "lucide-react";

function FriendRequests() {
  const { pendingRequests, getPendingRequests, acceptRequest, rejectRequest, sendFriendRequest, friends } = useFriendStore();

  const [email, setEmail]           = useState("");
  const [result, setResult]         = useState(null);   // single user or null
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg]     = useState("");
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    getPendingRequests();
  }, [getPendingRequests]);

  // Reset state when email changes
  useEffect(() => {
    setResult(null);
    setErrorMsg("");
    setRequestSent(false);
  }, [email]);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSearch = async () => {
    if (!email.trim())     return;
    if (!isValidEmail(email.trim())) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setIsSearching(true);
    setResult(null);
    setErrorMsg("");

    try {
      const res = await axiosInstance.get(`/friends/search?q=${email.trim()}`);
      if (res.data.length === 0) {
        setErrorMsg("No user found with that email");
      } else {
        setResult(res.data[0]); // email is unique so only one result
      }
    } catch (error) {
      setErrorMsg("Something went wrong. Try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId) => {
    await sendFriendRequest(userId);
    setRequestSent(true);
  };

  const handleClear = () => {
    setEmail("");
    setResult(null);
    setErrorMsg("");
    setRequestSent(false);
  };

  const isFriend = (userId) => friends.some((f) => f._id === userId);

  return (
    <div className="flex flex-col gap-4">

      {/* Email search */}
      <div className="flex flex-col gap-2">
        <p className="text-slate-400 text-xs uppercase tracking-wider">Find people by email</p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter email address..."
              className="w-full bg-slate-700/50 text-slate-200 text-sm rounded-lg pl-9 pr-8 py-2 outline-none focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-500"
            />
            {email && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching || !email.trim()}
            className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSearching ? "..." : "Search"}
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <p className="text-red-400 text-xs">{errorMsg}</p>
        )}

        {/* Search result */}
        {result && (
          <div className="bg-cyan-500/10 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="size-10 rounded-full">
                  <img src={result.profilePic || "/avatar.png"} alt={result.fullName} />
                </div>
              </div>
              <div>
                <p className="text-slate-200 text-sm font-medium">{result.fullName}</p>
                <p className="text-slate-400 text-xs">{result.email}</p>
                {isFriend(result._id) && (
                  <span className="text-xs text-cyan-400">Already friends</span>
                )}
              </div>
            </div>

            {!isFriend(result._id) && (
              <button
                onClick={() => handleSendRequest(result._id)}
                disabled={requestSent}
                className={`p-2 rounded-full transition-colors ${
                  requestSent
                    ? "bg-slate-600/40 text-slate-500 cursor-not-allowed"
                    : "bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400"
                }`}
                title={requestSent ? "Request sent" : "Send friend request"}
              >
                <UserPlus size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/50" />

      {/* Incoming requests */}
      <div className="flex flex-col gap-2">
        <p className="text-slate-400 text-xs uppercase tracking-wider">
          Incoming requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
        </p>

        {pendingRequests.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-2">No pending requests</p>
        ) : (
          pendingRequests.map((request) => (
            <div
              key={request._id}
              className="bg-cyan-500/10 p-3 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="size-10 rounded-full">
                    <img src={request.sender.profilePic || "/avatar.png"} alt={request.sender.fullName} />
                  </div>
                </div>
                <div>
                  <p className="text-slate-200 font-medium text-sm">{request.sender.fullName}</p>
                  <p className="text-slate-400 text-xs">{request.sender.email}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => acceptRequest(request._id)}
                  className="p-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 transition-colors"
                  title="Accept"
                >
                  <UserCheck size={15} />
                </button>
                <button
                  onClick={() => rejectRequest(request._id)}
                  className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                  title="Reject"
                >
                  <UserX size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FriendRequests;