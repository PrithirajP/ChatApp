import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.params;

        if (senderId.equals(receiverId)) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ message: "User not found" });
        }

        const alreadyFriends = await User.findOne({
            _id: senderId,
            friends: receiverId,
        });
        if (alreadyFriends) {
            return res.status(400).json({ message: "You are already friends" });
        }

        const request = await FriendRequest.create({ sender: senderId, receiver: receiverId });

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("friendRequest", {
                _id: request._id,
                sender: {
                    _id: req.user._id,
                    fullName: req.user.fullName,
                    profilePic: req.user.profilePic,
                },
                createdAt: request.createdAt,
            });
        }

        res.status(201).json({ message: "Friend request sent", request });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Friend request already sent" });
        }
        console.log("Error in sendFriendRequest: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if (!request.receiver.equals(req.user._id)) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "Request already handled" });
        }

        request.status = "accepted";
        await request.save();

        await User.findByIdAndUpdate(request.sender,   { $addToSet: { friends: request.receiver } });
        await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });

        const senderSocketId = getReceiverSocketId(request.sender);
        if (senderSocketId) {
            io.to(senderSocketId).emit("friendRequestAccepted", {
                acceptedBy: {
                    _id: req.user._id,
                    fullName: req.user.fullName,
                    profilePic: req.user.profilePic,
                },
            });
        }

        res.status(200).json({ message: "Friend request accepted" });

    } catch (error) {
        console.log("Error in acceptFriendRequest: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if (!request.receiver.equals(req.user._id)) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "Request already handled" });
        }

        request.status = "rejected";
        await request.save();

        res.status(200).json({ message: "Friend request rejected" });

    } catch (error) {
        console.log("Error in rejectFriendRequest: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeFriend = async (req, res) => {
    try {
        const userId = req.user._id;
        const { friendId } = req.params;

        await User.findByIdAndUpdate(userId,   { $pull: { friends: friendId } });
        await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

        await FriendRequest.findOneAndDelete({
            $or: [
                { sender: userId,   receiver: friendId },
                { sender: friendId, receiver: userId },
            ],
        });

        res.status(200).json({ message: "Friend removed" });

    } catch (error) {
        console.log("Error in removeFriend: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("friends", "-password");
        res.status(200).json(user.friends);
    } catch (error) {
        console.log("Error in getMyFriends: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({
            receiver: req.user._id,
            status: "pending",
        }).populate("sender", "fullName profilePic email");

        res.status(200).json(requests);
    } catch (error) {
        console.log("Error in getPendingRequests: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || !q.trim()) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Exact email match only 
        const user = await User.findOne({
            email: q.trim().toLowerCase(),
            _id: { $ne: req.user._id },
        }).select("-password");

        if (!user) {
            return res.status(200).json([]);
        }

        res.status(200).json([user]);

    } catch (error) {
        console.log("Error in searchUsers: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};