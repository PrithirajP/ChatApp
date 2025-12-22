import { create } from "zustand";
//import { getAllContacts } from "../../../backend/src/controllers/message.controller";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessageLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === true,

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
        set({isSoundEnabled: !get().isSoundEnabled})
    },

    setActiveTab: (tab) => set({activeTab:tab}),
    setSelectedUser: (selectedUser) => set({selectedUser}),

    getAllContacts: async() => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({ allContacts: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in getAllContacts UseChatStore: ", error);
        } finally {
            set({ isUsersLoading: false });
        }
    },
    getAllChatPartners: async() => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/chats");
            set({ chats: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
        set({ isUsersLoading: false });
        }
    },

    getMessagesByUserId: async (userId) => {
        set({isMessageLoading: true});
        try{
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages : res.data});
        } catch(error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({isMessageLoading: false});
        }
    },
}))