const express = require('express');
const fs = require('fs/promises');

const app = express();
const PORT = 8080;

app.use(express.json());

// Rutas para productos
const productsRouter = express.Router();
const productsFile = 'productos.json';

productsRouter.get('/', async (req, res) => {
  // Implementa la lógica para obtener y enviar todos los productos
  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    const products = JSON.parse(data);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener productos');
  }
});

productsRouter.get('/:pid', async (req, res) => {
  // Implementa la lógica para obtener y enviar un producto por id
  const productId = req.params.pid;

  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    const products = JSON.parse(data);
    const product = products.find((p) => p.id == productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener el producto');
  }
});

productsRouter.post('/', async (req, res) => {
  // Implementa la lógica para agregar un nuevo producto
  const newProduct = req.body;

  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    const products = JSON.parse(data);

    // Autogenera el ID (puedes implementar lógica más avanzada si lo deseas)
    newProduct.id = Date.now().toString();

    // Validación de campos obligatorios
    if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
      res.status(400).send('Todos los campos son obligatorios');
      return;
    }

    products.push(newProduct);

    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar el producto');
  }
});

productsRouter.put('/:pid', async (req, res) => {
  // Implementa la lógica para actualizar un producto por id
  const productId = req.params.pid;
  const updatedProduct = req.body;

  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    let products = JSON.parse(data);

    const index = products.findIndex((p) => p.id == productId);

    if (index !== -1) {
      // Conserva el ID original
      updatedProduct.id = productId;

      // Actualiza el producto
      products[index] = updatedProduct;

      await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
      res.json(updatedProduct);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar el producto');
  }
});

productsRouter.delete('/:pid', async (req, res) => {
  // Implementa la lógica para eliminar un producto por id
  const productId = req.params.pid;

  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    let products = JSON.parse(data);

    products = products.filter((p) => p.id != productId);

    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    res.send('Producto eliminado correctamente');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el producto');
  }
});

// Usa el router para las rutas de productos
app.use('/api/products', productsRouter);

// Rutas para carritos
const cartsRouter = express.Router();
const cartsFile = 'carrito.json';

cartsRouter.post('/', async (req, res) => {
  // Implementa la lógica para crear un nuevo carrito
  const newCart = req.body;

  try {
    const data = await fs.readFile(cartsFile, 'utf-8');
    const carts = JSON.parse(data);

    // Autogenera el ID (puedes implementar lógica más avanzada si lo deseas)
    newCart.id = Date.now().toString();

    carts.push(newCart);

    await fs.writeFile(cartsFile, JSON.stringify(carts, null, 2));
    res.status(201).json(newCart);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear el carrito');
  }
});

cartsRouter.get('/:cid', async (req, res) => {
  // Implementa la lógica para obtener y enviar los productos de un carrito por id
  const cartId = req.params.cid;

  try {
    const data = await fs.readFile(cartsFile, 'utf-8');
    const carts = JSON.parse(data);
    const cart = carts.find((c) => c.id == cartId);

    if (cart) {
      res.json(cart.products);
    } else {
      res.status(404).send('Carrito no encontrado');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los productos del carrito');
  }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
  // Implementa la lógica para agregar un producto a un carrito
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;

  try {
    const data = await fs.readFile(cartsFile, 'utf-8');
    let carts = JSON.parse(data);

    const cartIndex = carts.findIndex((c) => c.id == cartId);

    if (cartIndex !== -1) {
      const cart = carts[cartIndex];

      // Verifica si el producto ya está en el carrito
      const productIndex = cart.products.findIndex((p) => p.id == productId);

      if (productIndex !== -1) {
        // Si ya existe, incrementa la cantidad
        cart.products[productIndex].quantity += quantity;
      } else {
        // Si no existe, agrega el producto al carrito
        cart.products.push({ id: productId, quantity });
      }

      await fs.writeFile(cartsFile, JSON.stringify(carts, null, 2));
      res.json(cart.products);
    } else {
      res.status(404).send('Carrito no encontrado');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar el producto al carrito');
  }
});

// Usa el router para las rutas de carritos
app.use('/api/carts', cartsRouter);

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
