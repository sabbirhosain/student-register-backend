import mongoose from "mongoose";
import colors from "colors"

const database_configuration = async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL)
        console.log(`Database connection success on ${mongoose.connection.name}`.bgMagenta);
    } catch (error) {
        console.error(error)
        return res.send({ error: error.message || 'Internal Server Error' });
    }
}
export default database_configuration