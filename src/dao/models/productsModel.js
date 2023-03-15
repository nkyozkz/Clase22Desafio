import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productsCollection = "products";

const productsSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: Number,
  price: Number,
  status: Boolean,
  stock: Number,
  thumbnail: String,
});
productsSchema.plugin(mongoosePaginate);
export const productsModel = mongoose.model(productsCollection, productsSchema);
