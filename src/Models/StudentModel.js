import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
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
    father_name: {
        type: String,
        required: true,
        trim: true,
    },
    mother_name: {
        type: String,
        required: true,
        trim: true,
    },
    phone_number: {
        type: String,
        required: true,
        trim: true,
    },
    email_address: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    blood_group: {
        type: String,
        trim: true,
    },
    courses_name: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Courses',
        // required: true,
        trim: true,
    },
    courses_duration: {
        type: String,
        // required: true,
        trim: true,
    },
    courses_fee: {
        type: Number,
        required: true,
        trim: true,
    },
    courses_discount: {
        type: Number,
        trim: true,
        default: 0
    },
    courses_payment: {
        type: Number,
        required: true,
        trim: true,
    },
    courses_due: {
        type: Number,
        required: true,
        trim: true,
    },
    batch_no: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    note: {
        type: String,
        default: null
    },
    image: {
        type: Array,
        default: null
    },
    documents: {
        type: Array,
        default: null
    },
});

const StudentModel = mongoose.model("Student", StudentSchema);
export default StudentModel