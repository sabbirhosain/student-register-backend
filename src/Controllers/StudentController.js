import mongoose from "mongoose";
import StudentModel from "../Models/StudentModel.js";

export const store = async (req, res) => {
    try {
        const { first_name, last_name, father_name, mother_name, phone_number, email_address, blood_group, courses_name, courses_duration, courses_fee, courses_discount, courses_payment, courses_due, batch_no, address, note } = req.body
        
        const image = req.files
        // const image = req.files?.image ? req.files.image.map(file => ({
        //     filename: file.filename,
        //     url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
        // })) : null;

        const documents = req.files?.document ? req.files.document.map(file => ({
            filename: file.filename,
            url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
        })) : [];

        if (!first_name) {
            return res.json({ first_name: 'field is required' })
        }
        if (!last_name) {
            return res.json({ last_name: 'field is required' })
        }
        if (!father_name) {
            return res.json({ father_name: 'field is required' })
        }
        if (!mother_name) {
            return res.json({ mother_name: 'field is required' })
        }
        if (!phone_number) {
            return res.json({ phone_number: 'field is required' })
        }
        if (!email_address) {
            return res.json({ email_address: 'field is required' })
        }
        if (!blood_group) {
            return res.json({ blood_group: 'field is required' })
        }
        if (!courses_name) {
            return res.json({ courses_name: 'field is required' })
        }
        if (!courses_duration) {
            return res.json({ courses_duration: 'field is required' })
        }
        if (!courses_payment) {
            return res.json({ courses_payment: 'field is required' })
        }
        if (!courses_fee) {
            return res.json({ courses_fee: 'field is required' })
        }
        if (!courses_discount) {
            return res.json({ courses_discount: 'field is required' })
        }
        if (!courses_due) {
            return res.json({ courses_due: 'field is required' })
        }
        if (!batch_no) {
            return res.json({ batch_no: 'field is required' })
        }
        if (!address) {
            return res.json({ address: 'field is required' })
        }

        // existing name chack
        const existing = await StudentModel.exists({
            $or: [
                { email_address: email_address },
                { phone_number: phone_number }
            ]
        });
        if (existing) {
            return res.json({
                success: false,
                message: "Student is already exist"
            });
        }

        const result = await new StudentModel({
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + ' ' + last_name,
            father_name: father_name,
            mother_name: mother_name,
            email_address: email_address,
            phone_number: phone_number,
            blood_group: blood_group,
            courses_discount: courses_discount,
            courses_fee: courses_fee,
            courses_discount: courses_discount,
            courses_payment: courses_payment,
            courses_due: courses_due,
            batch_no: batch_no,
            address: address,
            note: note,
            image: image,
            documents: documents.map(att => att.filename),
            new_documents: documents
        }).save();

        if (result) {
            return res.json({
                success: true,
                massage: 'Item create successfully',
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

export const show = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const searchQuery = new RegExp('.*' + search + '.*', 'i');

        // Add search filter
        const dataFilter = { category_name: { $regex: searchQuery } }

        const data = await CategoryModel.find(dataFilter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)

        const count = await CategoryModel.find(dataFilter).countDocuments();

        // Convert category_name to Sentence Case
        const result = data.map(category => {
            return {
                ...category.toObject(),
                category_name: toSentenceCase(category.category_name)
            };
        });


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

        // find data
        const data = await CategoryModel.findById(id)

        // Convert category_name to Sentence Case
        const result = {
            ...data.toObject(),
            category_name: toSentenceCase(data.category_name)
        };

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
        const { id } = req.params;
        const { category_name } = req.body

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        // check category is exist or not
        const findUser = await CategoryModel.findById(id);
        if (!findUser) {
            return res.json({ massage: "Category not found" });
        }

        // not an empty string
        if (!category_name || category_name.trim() === "") {
            return res.json({ category_name: "is required and cannot be empty" });
        }

        // existing category name chack
        const exist = await CategoryModel.exists({ category_name: category_name });
        if (exist && exist._id.toString() !== id) {
            return res.json({ message: 'Category is already exists' });
        }

        const result = await CategoryModel.findByIdAndUpdate(id, {
            category_name: category_name,
            category_slug: slugify(category_name),
        }, { new: true })

        if (result) {
            return res.json({
                success: true,
                massage: 'Item update successfully',
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

        const result = await CategoryModel.findByIdAndDelete(id);

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