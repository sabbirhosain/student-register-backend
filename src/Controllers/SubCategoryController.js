import mongoose from "mongoose";
import slugify from "slugify";
import CategoryModel from "../Models/CategoryModel.js";
import SubCategoryModel from "../Models/SubCategoryModel.js";
import { toSentenceCase } from "../Utils/Helper.js";

export const store = async (req, res) => {
    try {
        const { category_id, subcategory_name } = req.body

        if (!category_id) {
            return res.json({ category_id: 'field is required' })
        }

        if (!subcategory_name) {
            return res.json({ subcategory_name: 'field is required' })
        }

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(category_id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        // convert categroy id to name
        const category = await CategoryModel.findById(category_id);
        if (!category) {
            return res.json({ message: "Category not found" })
        }

        // existing subcategory
        const existing = await SubCategoryModel.exists({ subcategory_name: subcategory_name });
        if (existing) {
            return res.json({
                success: false,
                message: "Sub category is already exist"
            });
        }

        const result = await new SubCategoryModel({
            category_id: category_id,
            category_name: category,
            subcategory_name: subcategory_name,
            subcategory_slug: slugify(subcategory_name),
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