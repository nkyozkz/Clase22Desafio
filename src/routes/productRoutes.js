import { Router } from "express";
import { productsModel } from "../dao/models/productsModel.js";
import { actualizarPagina } from "../public/js/funcionActualizaLinks.js";
import mongoose from "mongoose";

// import productosEnBd from "../dao/filesystem/managers/productManager.js";
// const productManager = productosEnBd;

const router = Router();

//* Obtener Productos

router.get("/", async (req, res) => {
  const productos = await productsModel.paginate({}, { limit: 6, page: 1 }); //* Buscamos los productos
  if (productos && productos.docs.length > 0) { //* Verificamos la existencia de los producto
    
    if (
      req.query.limit ||
      req.query.page ||
      req.query.sort ||
      req.query.query //* Revisamos si tienen params
    ) {
      let limite = req.query.limit;
      let pagina = req.query.page;
      let orden = req.query.sort;
      let query = req.query.query; //* Guardamos los params

      let filter = {
        //* Creamos una variable para configurar los filtros de la peticion
      };
      let options = {
        //* Creamos una variable para configurar las opciones de la peticion
        limit: limite || 6,
        page: pagina || 1,
      };

      if (orden == "asc" || orden == "desc" || orden == 1 || orden == -1) {
        //* En caso de que se pida ordenamiento agregamos la opcion
        options = {
          ...options,
          sort: { price: orden },
        };
      }
      if (query == "disponible") {
        //* En caso de que se busque por disponibilidad agregamos el filtro
        filter = {
          status: true,
        };
      }
      if (query == "agotado") {
        //* En caso de que se busque por disponibilidad agregamos el filtro
        filter = {
          status: false,
        };
      }
      const response = await productsModel.paginate(filter, options); //* Hacemos la paginación

      if (filter.status == false && response.docs.length < 1) {
        return res.status(400).send(`No hay productos agotados `);
      }
      if (pagina > response.totalPages || 0 >= pagina) {
        //* En caso de que busque una página inexistente sera informado
        return res
          .status(400)
          .send(
            `Página no encontrada, las páginas van de 1 a ${response.totalPages} `
          );
      }

      let newGetFormat = {
        status: "Success",
        payload: response.docs,
        totalPages: response.totalPages,
        prevPage: response.prevPage,
        nextPage: response.nextPage,
        page: response.page,
        hasPrevPage: response.hasPrevPage,
        hasNextPage: response.hasNextPage,
        prevLink: actualizarPagina(await response.totalPages, "anterior",req.originalUrl),
        nextLink: actualizarPagina(await response.totalPages, "siguiente",req.originalUrl),
      };

      return res.status(200).send(newGetFormat);
    }
    res.status(200).send({
      status: "Success",
      payload: productos.docs,
      totalPages: productos.totalPages,
      prevPage: productos.prevPage,
      nextPage: productos.nextPage,
      page: productos.page,
      hasPrevPage: productos.hasPrevPage,
      hasNextPage: productos.hasNextPage,
      prevLink: actualizarPagina(await productos.totalPages, "anterior",req.originalUrl),
      nextLink: actualizarPagina(await productos.totalPages, "siguiente",req.originalUrl),
    });
  } else {
    res.status(400).send(`No hay ningún producto en la empresa`);
  }
});

//* Subir producto
router.post("/", async (req, res) => {
  let nuevoProducto = req.body;
  let verificacionDeCode = await productsModel.find({
    code: nuevoProducto.code,
  });
  if (verificacionDeCode.length > 0) {

    return res.status(400).send({
      message: "error, código existente",
    });
  }
  const response = await productsModel.insertMany(nuevoProducto);
  res.status(200).send({
    status: "Success, codigo subido correctamente",
    payload: response,
  });
});

//* Traer Productos con un id
router.get("/:pid", async (req, res) => {
  let id = req.params.pid;
  if (mongoose.Types.ObjectId.isValid(id)) {
    let producto = await productsModel.find({ _id: id });
    if (producto.length > 0) {
      return res.status(200).send({
        status: "product found",
        product: producto,
      });
    } else {
      return res.status(400).send("Product not found");
    }
  }
  res.status(400).send("Formato de id no valido");
});

//*Actualizar productos
router.put("/:pid", async (req, res) => {
  let idActualizar = req.params.pid;
  if (mongoose.Types.ObjectId.isValid(idActualizar)) {
    let producto = await productsModel.find({ _id: idActualizar });
    if (producto.length > 0) {
      let nuevaInformacion = req.body;
      if (nuevaInformacion) {
        await productsModel.updateOne({ _id: idActualizar }, nuevaInformacion);
        res.status(200).send(`Actualizado correctamente`);
      } else {
        res.status(400).send(`Coloca la información a cambiar`);
      }
    } else {
      res.status(400).send("El id del producto no existe");
    }
  } else {
    res.status(400).send("Coloca un id valido");
  }
});

//* Eliminar productos
router.delete("/:pid", async (req, res) => {
  let idEliminar = req.params.pid;
  if (mongoose.Types.ObjectId.isValid(idEliminar)) {
    let producto = await productsModel.find({ _id: idEliminar });
    if (producto.length > 0) {
      await productsModel.deleteOne({ _id: idEliminar });
      res.status(200).send({
        status: "Success, product removed successfully",
      });
    } else {
      res.status(400).send("El id del producto no existe");
    }
  } else {
    res.status(400).send("Coloca un id valido");
  }
});

export default router;
