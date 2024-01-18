import mongoose from "mongoose";

const postSchema = mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
)

export const Post = mongoose.model("Post", postSchema)