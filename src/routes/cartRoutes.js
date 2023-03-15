import { Router } from "express";
import mongoose from "mongoose";
import { cartsModel } from "../dao/models/cartsModel.js";
import { productsModel } from "../dao/models/productsModel.js";
const router = Router();
// import carrito from "../dao/filesystem/manangers/cartManager.js";
// import productosEnBd from "../dao/filesystem/managers/productManager.js";
// const productMananger=productosEnBd

//* Listar todos los carritos
router.get("/", async (req, res) => {
  await cartsModel
    .find()
    .then((carrito) => {
      if (carrito.length == 0) throw new Error("required");
      res.status(200).send({
        result: "success",
        carts: carrito,
      });
    })
    .catch((err) => {
      res.status(400).send(`No hay ningún carrito`);
    });
});
//* Crear nuevos carritos
router.post("/", async (req, res) => {
  const nuevoCarrito = {
    products: [],
  };
  let result = await cartsModel.create(nuevoCarrito);
  res.status(200).send({
    result: "success",
    payload: result,
  });
});

//*Buscar carrito por id y mostrarlo
router.get("/:cid", async (req, res) => {
  let id = req.params.cid;
  if (mongoose.Types.ObjectId.isValid(id)) {
    let carrito = await cartsModel.find({ _id: id });
    if (carrito.length > 0) {
      res.status(200).send({
        result: "success",
        payload: carrito,
      });
    } else {
      res.status(400).send("Carrito no encontrado");
    }
  } else {
    res.status(400).send("Coloca un id valido");
  }
});

//* Actualizar carrito
router.post("/:cid/products/:pid", async (req, res) => {
  //*Recogemos los query
  let carritoId = req.params.cid;
  let productoId = req.params.pid;

  if (
    //* Verificamos que los id sean validos
    mongoose.Types.ObjectId.isValid(carritoId) &&
    mongoose.Types.ObjectId.isValid(productoId)
  ) {
    //* Verificamos la existencia del producto/carrito
    let validarProducto;
    let validarCarrito;

    await productsModel.find({ _id: productoId }).then((product) => {
      if (product.length > 0) {
        return (validarProducto = product);
      }
      res.status(400).send("Producto no encontrado");
    });
    await cartsModel.find({ _id: carritoId }).then((cartSearch) => {
      if (cartSearch.length > 0) {
        return (validarCarrito = cartSearch);
      }
      res.status(400).send("Carrito no encontrado");
    });
    if (validarCarrito && validarProducto) {
      let buscarProductoDentro = await cartsModel.findOne({
        "products._id": productoId,
      });
      if (buscarProductoDentro) {
        await cartsModel.updateOne(
          { "products._id": productoId },
          { $inc: { "products.$.quantity": +1 } }
        );
        return res.status(400).send({ status: "Actualizado Correctamente" });
      }
      await cartsModel.updateOne(
        { _id: carritoId },
        { $push: { products: { _id: productoId }, quantity: 1 } }
      );
      res.status(400).send({ status: "Succes" });
    }
  } else {
    res.status(400).send(`Coloca id válidos`);
  }
});

//*Eliminar carrito

router.delete("/:cid/products/:pid", async (req, res) => {
  //*Recogemos los query
  let carritoId = req.params.cid;
  let productoId = req.params.pid;

  if (
    //* Verificamos que los id sean validos
    mongoose.Types.ObjectId.isValid(carritoId) &&
    mongoose.Types.ObjectId.isValid(productoId)
  ) {
    //* Verificamos la existencia del producto/carrito
    let validarProducto;
    let validarCarrito;

    await productsModel.find({ _id: productoId }).then((product) => {
      if (product.length > 0) {
        return (validarProducto = product);
      }
      res.status(400).send("Producto no encontrado");
    });
    await cartsModel.find({ _id: carritoId }).then((cartSearch) => {
      if (cartSearch.length > 0) {
        return (validarCarrito = cartSearch);
      }
      res.status(400).send("Carrito no encontrado");
    });
    if (validarCarrito && validarProducto) {
      let buscarProductoDentro = await cartsModel.findOne({
        "products._id": productoId,
      });
      if (buscarProductoDentro) {
        await cartsModel.updateOne(
          { "products._id": productoId },
          { $pull: { products: { _id: productoId } } }
        );
        return res.status(200).send({ status: "Eliminado Correctamente" });
      }
      res
        .status(400)
        .send({ status: "Producto no encontrado dentro del carrito" });
    }
  } else {
    res.status(400).send(`Coloca id válidos`);
  }
});

//* Actualizar el carrito con un arreglo

router.put("/:cid", async (req, res) => {
  //*Recogemos los query
  let carritoId = req.params.cid;
  let productos = req.body.products;

  let actualizarCarrito = async () => {
    let validacionCarrito = mongoose.Types.ObjectId.isValid(carritoId);
    if (!validacionCarrito) {
      return res
        .status(400)
        .send(
          `carritoId: ${carritoId} No es valido, porfavor coloca ids validos`
        );
    }
    for (let producto of productos) {
      let id = producto._id;
      let validacion = mongoose.Types.ObjectId.isValid(id);
      if (!validacion) {
        return res
          .status(400)
          .send(
            `productId: ${producto._id} No es valido, porfavor coloca ids validos`
          );
      }
    }
    console.log("Ids Validados");

    let confirmacionDeProductos;
    for (let producto of productos) {
      await productsModel.find({ _id: producto._id }).then((product) => {
        if (!(product.length > 0)) {
          return res
            .status(400)
            .send(`no existe producto con el id:${producto._id}`);
        }
      });
    }
    console.log("Productos encontrados");
    confirmacionDeProductos = true;

    let confirmacionDeCarrito;
    await cartsModel.find({ _id: carritoId }).then((cartSearch) => {
      if (!(cartSearch.length > 0)) {
        return res.status(400).send("Carrito no encontrado");
      }
      return (confirmacionDeCarrito = true);
    });

    if (confirmacionDeCarrito && confirmacionDeProductos) {
      let carrito = await cartsModel.updateOne(
        { _id: carritoId },
        { products: productos }
      );
      res.status(200).send(`Productos agregados correctamente`);
    }
  };

  actualizarCarrito();
});

//* Actualizar cantidades del producto

router.put("/:cid/products/:pid", async (req, res) => {
  //*Recogemos los query
  let carritoId = req.params.cid;
  let productoId = req.params.pid;
  let cantidadNueva = req.body.quantity;

  if (
    //* Verificamos que los id sean validos
    mongoose.Types.ObjectId.isValid(carritoId) &&
    mongoose.Types.ObjectId.isValid(productoId)
  ) {
    //* Verificamos la existencia del producto/carrito
    let validarProducto;
    let validarCarrito;

    await productsModel.find({ _id: productoId }).then((product) => {
      if (product.length > 0) {
        return (validarProducto = product);
      }
      res.status(400).send("Producto no encontrado");
    });
    await cartsModel.find({ _id: carritoId }).then((cartSearch) => {
      if (cartSearch.length > 0) {
        return (validarCarrito = cartSearch);
      }
      res.status(400).send("Carrito no encontrado");
    });
    if (validarCarrito && validarProducto) {
      let buscarProductoDentro = await cartsModel.findOne({
        "products._id": productoId,
      });
      if (buscarProductoDentro) {
        await cartsModel.updateOne(
          { "products._id": productoId },
          { "products.$.quantity": cantidadNueva }
        );
        return res
          .status(400)
          .send({ status: "cantidades cambiadas correctamente" });
      }
      await cartsModel.updateOne(
        { _id: carritoId },
        { $push: { products: { _id: productoId }, quantity: cantidadNueva } }
      );
      res.status(400).send({ status: "Succes" });
    }
  } else {
    res.status(400).send(`Coloca id válidos`);
  }
});

//* Eliminar todos los productos de un carrito
router.delete("/:cid", async (req, res) => {
  let carritoId = req.params.cid;
  let productos = {
    "products": [],
  };
  let confirmacionDeCarrito;
  await cartsModel.find({ _id: carritoId }).then((cartSearch) => {
    if (!(cartSearch.length > 0)) {
      return res.status(400).send("Carrito no encontrado");
    }
    return (confirmacionDeCarrito = true);
  });

  if (confirmacionDeCarrito) {
    let carrito = await cartsModel.updateOne(
      { _id: carritoId },
      { $set: { products: [] }}
    );
    res.status(200).send(`Productos eliminados correctamente`);
  }
});

export default router;
