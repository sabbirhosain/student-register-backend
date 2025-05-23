import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    full_name: {
        type: String,
        trim: true
    },
    user_name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
        validate: {
            validator: function (v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        },
    },

    password: {
        type: String,
        required: true,
        trim: true,
        min: [3, 'password must be greater than 3'],
        set: (value) => bcrypt.hashSync(value, bcrypt.genSaltSync(10))
    },

    address: {
        type: String,
        trim: true,
        default: null
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    profile_image: {
        type: String,
        default: null
    },
    join_date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'manager']
    },

}, { timestamps: true })

const UserModel = mongoose.model("User", UserSchema);
export default UserModel