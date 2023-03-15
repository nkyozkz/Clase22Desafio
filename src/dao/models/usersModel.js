import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userCollection = "users";

const userSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  user: String,
  email: String,
  age: Number,
  password: String,
  rol: String,
});

userSchema.plugin(mongoosePaginate);
const userModel = mongoose.model(userCollection, userSchema);

export default userModel;
