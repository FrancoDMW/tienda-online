const express = require('express');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'productos_prueba'
});

// Configuración de Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

// Ruta para obtener todos los productos (Read)
app.get('/', (req, res) => {
    const query = 'SELECT * FROM productos';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.render('home', { productos: results });
    });
});

// Ruta para agregar un nuevo producto (Create)
app.post('/productos', (req, res) => {
    const { nombre, cantidad, precio, url_imagen } = req.body;
    const query = 'INSERT INTO productos (nombre, cantidad, precio, url_imagen) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, cantidad, precio, url_imagen], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Ruta para actualizar un producto (Update)
app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { accion } = req.body;

    let query;
    let params;

    if (accion === 'incrementar') {
        query = 'UPDATE productos SET cantidad = cantidad + 1 WHERE id = ?';
        params = [id];
    } else if (accion === 'decrementar') {
        query = 'UPDATE productos SET cantidad = cantidad - 1 WHERE id = ?';
        params = [id];
    } else {
        return res.status(400).send('Acción inválida');
    }

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error al actualizar el stock:', err);
            return res.status(500).send('Error al actualizar el stock');
        }

        // Obtener el producto actualizado
        const getProductoQuery = 'SELECT * FROM productos WHERE id = ?';
        db.query(getProductoQuery, [id], (err, results) => {
            if (err) {
                console.error('Error al obtener el producto actualizado:', err);
                return res.status(500).send('Error al obtener el producto actualizado');
            }
            if (results.length === 0) {
                return res.status(404).send('Producto no encontrado');
            }
            const productoActualizado = results[0];
            res.json({ cantidad: productoActualizado.cantidad });
        });
    });
});

// Ruta para eliminar un producto (Delete)
app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM productos WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) throw err;
        res.send('Producto eliminado con éxito');
    });
});

// Ruta para mostrar el formulario de agregar producto
app.get('/agregar-producto', (req, res) => {
    res.render('agregar_producto');
});

// Ruta para agregar un nuevo producto (Create)
app.post('/agregar-producto', (req, res) => {
    const { nombre, cantidad, precio, url_imagen } = req.body;

    const query = 'INSERT INTO productos (nombre, cantidad, precio, url_imagen) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, cantidad, precio, url_imagen], (err, result) => {
        if (err) {
            console.error('Error al agregar producto:', err);
            return res.status(500).send('Error al agregar producto');
        }
        res.redirect('/'); // Redirecciona al inicio o a la página donde se lista los productos
    });
});

// Ruta para eliminar un producto (Delete)
app.post('/eliminar-producto', (req, res) => {
    const { nombreEliminar, idEliminar } = req.body;

    const query = 'DELETE FROM productos WHERE nombre = ? AND id = ?';
    db.query(query, [nombreEliminar, idEliminar], (err, result) => {
        if (err) {
            console.error('Error al eliminar producto:', err);
            return res.status(500).send('Error al eliminar producto');
        }
        res.redirect('/'); // Redirige a la página principal u otra página adecuada
    });
});
// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});