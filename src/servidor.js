import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import _dirname from "./utils.js";
import productsRouter from "./routes/productRoutes.js";
import cartsRouter from "./routes/cartRoutes.js";
import homeHandlebar from "./routes/viewRoutes.js";
import sessionRouter from "./routes/sessionRoutes.js";
import dotenv from "dotenv";

import { productsModel } from "./dao/models/productsModel.js";
import { messagesModel } from "./dao/models/messagesModel.js";
import passport from "passport";
import initializePassport from "./config/passportConfig.js";
dotenv.config();

// import productosEnBd from "./dao/filesystem/managers/productManager.js";
// const productMananger = productosEnBd;
// let data = await productManager.getProducts();

const app = express();
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      ttl: 30,
    }),
    secret: process.env.APP_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

const port = process.env.PORT || 8080;

initializePassport()
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(_dirname + `/public`));

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Conectado a Mongo Atlas"))
  .catch((err) =>
    console.error("Ha ocurrido un error conectandose a mongo atlas")
  );

const httpServer = app.listen(port, () => {
  console.log(`servidor escuchando en el puerto 8080`);
});
const io = new Server(httpServer);

app.engine(`handlebars`, handlebars.engine());
app.set(`views`, "src/views");
app.set(`partials`, "src/partials");
app.set(`view engine`, `handlebars`);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/session", sessionRouter);
app.use("/", homeHandlebar);

io.on(`connection`, async (socket) => {
  console.log(`Nuevo cliente conectado`);
  socket.emit(`datos`, await productsModel.find());
  socket.emit("messages", await messagesModel.find());
  socket.on("newMessage", async (data) => {
    await messagesModel.insertMany([data]);
    io.emit("messages", await messagesModel.find());
  });
});
