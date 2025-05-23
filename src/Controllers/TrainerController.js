import mongoose from "mongoose";
import TrainerModel from "../Models/TrainerModel.js";

export const store = async (req, res) => {
    try {
        const { first_name, last_name, email_address, phone_number, expert_in } = req.body
        const image = req.file ? req.file.filename : null; // image upload

        if (!first_name) {
            return res.json({ first_name: 'field is required' })
        }
        if (!last_name) {
            return res.json({ last_name: 'field is required' })
        }
        if (!email_address) {
            return res.json({ email_address: 'field is required' })
        }
        if (!phone_number) {
            return res.json({ phone_number: 'field is required' })
        }
        if (!expert_in) {
            return res.json({ expert_in: 'field is required' })
        }

        // existing name chack
        const existing = await TrainerModel.exists({
            $or: [
                { email_address: email_address },
                { phone_number: phone_number }
            ]
        });
        if (existing) {
            return res.json({
                success: false,
                message: "Trainer Contact already exist"
            });
        }

        const result = await new TrainerModel({
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + " " + last_name,
            email_address: email_address,
            phone_number: phone_number,
            expert_in: expert_in,
            trainer_image: image,
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
                { full_name: { $regex: searchQuery } },
                { email_address: { $regex: searchQuery } },
                { phone_number: { $regex: searchQuery } },
            ]
        }

        const result = await TrainerModel.find(dataFilter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)

        const count = await TrainerModel.find(dataFilter).countDocuments();

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

        const result = await TrainerModel.findById(id);

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
        const { first_name, last_name, email_address, phone_number, expert_in, trainer_image } = req.body

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        // check trainer is exist or not
        const findTrainer = await TrainerModel.findById(id);
        if (!findTrainer) {
            return res.json({ massage: "Trainer not found" });
        }

        // image upload
        const image = req.file ? req.file.filename : (trainer_image || findTrainer?.trainer_image);

        // not an empty string
        if (!first_name || first_name.trim() === "") {
            return res.json({ first_name: "is required and cannot be empty" });
        }

        if (!last_name || last_name.trim() === "") {
            return res.json({ last_name: "is required and cannot be empty" });
        }

        if (!email_address || email_address.trim() === "") {
            return res.json({ email_address: "is required and cannot be empty" });
        }

        if (!phone_number || phone_number.trim() === "") {
            return res.json({ phone_number: "is required and cannot be empty" });
        }

        if (!expert_in || expert_in.trim() === "") {
            return res.json({ expert_in: "is required and cannot be empty" });
        }

        // existing email chack
        const exist_email = await TrainerModel.exists({ email_address: email_address });
        if (exist_email && exist_email._id.toString() !== id) {
            return res.json({ message: 'Email is already exists' });
        }

        // existing phone chack
        const exist_phone = await TrainerModel.exists({ phone_number: phone_number });
        if (exist_phone && exist_phone._id.toString() !== id) {
            return res.json({ message: 'Phone Number already exists' });
        }

        // update
        const result = await TrainerModel.findByIdAndUpdate(id, {
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + " " + last_name,
            email_address: email_address,
            phone_number: phone_number,
            expert_in: expert_in,
            trainer_image: image,
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

        const result = await TrainerModel.findByIdAndDelete(id);

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