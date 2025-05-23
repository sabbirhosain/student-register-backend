import mongoose from "mongoose";

const CoursesSchema = new mongoose.Schema({
    course_name: {
        type: String,
        required: true,
        trim: true,
    },
    trainer_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Trainer',
        required: true,
        trim: true,
    },
    trainer_name: {
        type: String,
        trim: true,
    },
    courses_duration: {
        type: String,
        required: true,
        trim: true,
    },
    courses_fee: {
        type: Number,
        required: true,
        trim: true,
    },
    class_per_week: {
        type: String,
        required: true,
        trim: true,
    },
    class_days: {
        type: String,
        required: true,
        trim: true,
    },

});

const CoursesModel = mongoose.model("Courses", CoursesSchema);
export default CoursesModel