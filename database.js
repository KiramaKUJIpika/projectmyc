const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// ── Default seed data ─────────────────────────────────────────────────
const DEFAULT_DB = {
    users: [],
    orders: [],
    products: [
        {
            id: 1,
            name: 'Guardiões da Galáxia #1',
            category: 'Marvel',
            description: 'Edição de estreia, capa variante. Em ótimo estado de conservação.',
            price: 45,
            rating: 4.9,
            reviews: 312,
            inStock: true,
            image: '🚀',
            vendor: 'ComicVault',
            vendorRating: 4.8
        },
        {
            id: 2,
            name: 'Batman: Ano Um',
            category: 'DC',
            description: 'Clássico definitivo da origem do Cavaleiro das Trevas.',
            price: 60,
            rating: 4.9,
            reviews: 218,
            inStock: true,
            image: '🦇',
            vendor: 'GothamComics',
            vendorRating: 4.9
        },
        {
            id: 3,
            name: 'Akira Vol. 1',
            category: 'Mangá',
            description: 'Edição de luxo capa dura. Papel de alta qualidade.',
            price: 90,
            rating: 5.0,
            reviews: 156,
            inStock: true,
            image: '⚡',
            vendor: 'TokyoPop Store',
            vendorRating: 5.0
        },
        {
            id: 4,
            name: 'Homem-Aranha: De Volta ao Lar',
            category: 'Marvel',
            description: 'Arco completo em box especial. Reimpressão limitada.',
            price: 75,
            rating: 4.6,
            reviews: 98,
            inStock: false,
            image: '🕷️',
            vendor: 'ComicVault',
            vendorRating: 4.8
        },
        {
            id: 5,
            name: 'Sandman: Prelúdios e Noturnos',
            category: 'Vertigo',
            description: 'Obra-prima de Neil Gaiman. Primeira edição nacional.',
            price: 85,
            rating: 4.8,
            reviews: 442,
            inStock: true,
            image: '🌙',
            vendor: 'DreamRealm Books',
            vendorRating: 4.9
        },
        {
            id: 6,
            name: 'One Piece Vol. 100',
            category: 'Mangá',
            description: 'Edição comemorativa com pôster exclusivo.',
            price: 55,
            rating: 4.7,
            reviews: 87,
            inStock: true,
            image: '☠️',
            vendor: 'TokyoPop Store',
            vendorRating: 4.7
        }
    ]
};

// ── Load / Save ───────────────────────────────────────────────────────
function load() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        }
    } catch (e) {
        console.error('DB read error:', e.message);
    }
    return structuredClone(DEFAULT_DB);
}

function save(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('DB write error:', e.message);
    }
}

function getDB() {
    return load();
}

// ── Users ─────────────────────────────────────────────────────────────
function getUsers() {
    return getDB().users;
}

function findUserByEmail(email) {
    return getUsers().find(u => u.email === email.toLowerCase());
}

function findUserById(id) {
    return getUsers().find(u => u.id === id);
}

function createUser(email, hashedPassword) {
    const db = getDB();
    const user = {
        id: Date.now(),
        email: email.toLowerCase(),
        username: email.split('@')[0],
        password: hashedPassword,
        balance: 1.0,
        joinDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    db.users.push(user);
    save(db);
    return user;
}

// ── Products ──────────────────────────────────────────────────────────
function getProducts() {
    return getDB().products;
}

function findProductById(id) {
    return getProducts().find(p => p.id === Number(id));
}

// ── Orders ────────────────────────────────────────────────────────────
function getOrders() {
    return getDB().orders;
}

function getOrdersByUser(userId) {
    return getOrders().filter(o => o.userId === userId);
}

function findOrderById(id) {
    return getOrders().find(o => o.id === id);
}

function createOrder(userId, { items, total, address, paymentMethod }) {
    const db = getDB();
    const order = {
        id: 'ORD-' + Date.now(),
        userId,
        items,
        total,
        address,
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    db.orders.push(order);
    save(db);
    return order;
}

function updateOrderStatus(orderId, status) {
    const db = getDB();
    const order = db.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    save(db);
    return order;
}

module.exports = {
    getUsers,
    findUserByEmail,
    findUserById,
    createUser,
    getProducts,
    findProductById,
    getOrders,
    getOrdersByUser,
    findOrderById,
    createOrder,
    updateOrderStatus
};
