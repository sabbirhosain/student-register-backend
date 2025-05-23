import mongoose from "mongoose";

const TrainerSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        trim: true,
    },
    last_name: {
        type: String,
        required: true,
        trim: true,
    },
    full_name: {
        type: String,
        trim: true,
    },
    email_address: {
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
    phone_number: {
        type: String,
        required: true,
        trim: true,
    },
    expert_in: {
        type: String,
        required: true,
        trim: true,
    },
    joining_date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    trainer_image: {
        type: String,
        default: null
    },

});

const TrainerModel = mongoose.model("Trainer", TrainerSchema);
export default TrainerModel