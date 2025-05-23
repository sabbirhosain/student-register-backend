import mongoose from "mongoose";
import CoursesModel from "../Models/CoursesModel.js";
import TrainerModel from "../Models/TrainerModel.js";

export const store = async (req, res) => {
    try {
        const { course_name, trainer_id, courses_duration, courses_fee, class_per_week, class_days } = req.body

        if (!course_name) {
            return res.json({ course_name: 'field is required' })
        }
        if (!courses_duration) {
            return res.json({ courses_duration: 'field is required' })
        }
        if (!courses_fee) {
            return res.json({ courses_fee: 'field is required' })
        }
        if (!class_per_week) {
            return res.json({ class_per_week: 'field is required' })
        }
        if (!class_days) {
            return res.json({ class_days: 'field is required' })
        }

        // existing name chack
        const existing = await CoursesModel.exists({
            $or: [
                { course_name: course_name },
            ]
        });

        if (existing) {
            return res.json({
                success: false,
                message: "Courses is already exist"
            });
        }

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(trainer_id)) {
            return res.json({ success: false, message: "Invalid Tainer ID format" });
        }

        // convert trainer id to name
        const trainer = await TrainerModel.findById(trainer_id);
        if (!trainer) {
            return res.json({ message: "Tainer not found" })
        }

        const result = await new CoursesModel({
            course_name: course_name,
            trainer_id: trainer_id,
            trainer_name: trainer.full_name,
            courses_duration: courses_duration,
            courses_fee: courses_fee,
            class_per_week: class_per_week,
            class_days: class_days,
        }).save();

        if (result) {
            return res.json({
                success: true,
                massage: 'Item create successfully',
                payload: result
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const show = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const searchQuery = new RegExp('.*' + search + '.*', 'i');

        // Add search filter
        const dataFilter = {
            $or: [
                { course_name: { $regex: searchQuery } },
                { trainer_name: { $regex: searchQuery } },
            ]
        }

        const result = await CoursesModel.find(dataFilter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)

        const count = await CoursesModel.find(dataFilter).countDocuments();

        // Check not found
        if (result.length === 0) {
            return res.json({ message: "No Data found" });
        } else {
            return res.json({
                success: true,
                massage: 'Item Show Successfully',
                pagination: {
                    per_page: limit,
                    total_data: count,
                    current_page: page,
                    total_page: Math.ceil(count / limit),
                    previous: page - 1 > 0 ? page - 1 : null,
                    next: page + 1 <= Math.ceil(count / limit) ? page + 1 : null
                },
                payload: result,
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const single = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        const result = await CoursesModel.findById(id);

        // Check not found
        if (!result) {
            return res.json({ message: "Data not found" });
        } else {
            return res.json({
                success: true,
                massage: 'Item Show Successfully',
                payload: result
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const { course_name, trainer_id, courses_duration, courses_fee, class_per_week, class_days } = req.body

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        // check trainer is exist or not
        const findCourse = await CoursesModel.findById(id);
        if (!findCourse) {
            return res.json({ massage: "Courses not found" });
        }

        // not an empty string
        if (!course_name || course_name.trim() === "") {
            return res.json({ course_name: "is required and cannot be empty" });
        }

        if (!trainer_id || trainer_id.trim() === "") {
            return res.json({ trainer_id: "is required and cannot be empty" });
        }

        if (!courses_duration || courses_duration.trim() === "") {
            return res.json({ courses_duration: "is required and cannot be empty" });
        }

        if (!courses_fee || courses_fee.trim() === "") {
            return res.json({ courses_fee: "is required and cannot be empty" });
        }

        if (!class_per_week || class_per_week.trim() === "") {
            return res.json({ class_per_week: "is required and cannot be empty" });
        }

        if (!class_days || class_days.trim() === "") {
            return res.json({ class_days: "is required and cannot be empty" });
        }

        // existing email chack
        const exist_courses = await CoursesModel.exists({ course_name: course_name });
        if (exist_courses && exist_courses._id.toString() !== id) {
            return res.json({ message: 'Courses is already exists' });
        }

        // convert trainer id to name
        const trainer = await TrainerModel.findById(trainer_id);
        if (!trainer) {
            return res.json({ message: "Tainer not found" })
        }
        
        // update
        const result = await CoursesModel.findByIdAndUpdate(id, {
            course_name: course_name,
            trainer_id: trainer_id,
            trainer_name: trainer.full_name,
            courses_duration: courses_duration,
            courses_fee: courses_fee,
            class_per_week: class_per_week,
            class_days: class_days,
        }, { new: true })

        if (result) {
            return res.json({
                success: true,
                massage: 'Item Update Successfully',
                payload: result
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const destroy = async (req, res) => {
    try {
        const { id } = req.params

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        const result = await CoursesModel.findByIdAndDelete(id);

        // Check not found
        if (!result) {
            return res.json({ message: "Data not found" });
        } else {
            return res.json({
                success: true,
                massage: 'Item Destroy Successfully',
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}