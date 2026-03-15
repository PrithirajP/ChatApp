import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useFriendStore = create((set, get) => ({
    friends: [],
    pendingRequests: [],
    isLoading: false,

    getMyFriends: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/friends");
            set({ friends: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch friends");
        } finally {
            set({ isLoading: false });
        }
    },

    getPendingRequests: async () => {
        try {
            const res = await axiosInstance.get("/friends/pending");
            set({ pendingRequests: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch requests");
        }
    },

    sendFriendRequest: async (receiverId) => {
        try {
            await axiosInstance.post(`/friends/send/${receiverId}`);
            toast.success("Friend request sent!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send request");
        }
    },

    acceptRequest: async (requestId) => {
        try {
            await axiosInstance.put(`/friends/accept/${requestId}`);
            toast.success("Friend added!");
            // Refresh both lists
            get().getPendingRequests();
            get().getMyFriends();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to accept request");
        }
    },

    rejectRequest: async (requestId) => {
        try {
            await axiosInstance.put(`/friends/reject/${requestId}`);
            toast.success("Request rejected");
            get().getPendingRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reject request");
        }
    },

    removeFriend: async (friendId) => {
        try {
            await axiosInstance.delete(`/friends/remove/${friendId}`);
            toast.success("Friend removed");
            get().getMyFriends();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove friend");
        }
    },

    // Call this once inside useAuthStore's connectSocket
    subscribeToFriendEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Incoming friend request — update pending list
        socket.on("friendRequest", (request) => {
            set((state) => ({ pendingRequests: [...state.pendingRequests, request] }));
            toast(`${request.sender.fullName} sent you a friend request!`, { icon: "👋" });
        });

        // Your request was accepted — update friends list
        socket.on("friendRequestAccepted", ({ acceptedBy }) => {
            get().getMyFriends();
            toast.success(`${acceptedBy.fullName} accepted your friend request!`);
        });
    },

    unsubscribeFromFriendEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("friendRequest");
        socket.off("friendRequestAccepted");
    },
}));