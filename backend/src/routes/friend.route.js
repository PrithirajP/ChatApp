import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getMyFriends,
    getPendingRequests,
    searchUsers,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/",                        getMyFriends);
router.get("/pending",                 getPendingRequests);
router.get("/search",                  searchUsers);       // 👈 added
router.post("/send/:receiverId",       sendFriendRequest);
router.put("/accept/:requestId",       acceptFriendRequest);
router.put("/reject/:requestId",       rejectFriendRequest);
router.delete("/remove/:friendId",     removeFriend);

export default router;