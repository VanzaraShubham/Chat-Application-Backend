import mongoose, { model } from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {type:String, required: true},
    receiverId: {type:String, required: true},
    text: {type:String},
    image: {type:String},
    // password: {type:String, required: true, minlength:6},
}, {timestamps: true});

const Message = mongoose.model("Message", messageSchema);
export default Message;