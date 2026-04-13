import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Package2, ShoppingCart, Plus, Loader2, Users, ShoppingBag } from 'lucide-react';
import apiClient from '../api/client';

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/auth');
    };

    const NavItem = ({ to, icon: Icon, label }: any) => {
        const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
        return (
            <Link to={to} className="nav-item" style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '8px', color: isActive ? 'white' : 'var(--text-muted)',
                background: isActive ? 'var(--primary)' : 'transparent',
                textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s ease'
            }}>
                <Icon size={20} />
                {label}
            </Link>
        );
    };

    return (
        <div className="app-container animate-fade-in">
            <aside className="sidebar">
                <div style={{ padding: '0 8px 24px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Package2 color="var(--primary)" size={28} />
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>InventoOS</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <NavItem to="/dashboard" icon={Home} label="Overview" />
                    <NavItem to="/dashboard/storefront" icon={ShoppingBag} label="Storefront" />
                    <NavItem to="/dashboard/customers" icon={Users} label="Customers" />
                    <NavItem to="/dashboard/products" icon={Package2} label="Inventory" />
                    <NavItem to="/dashboard/orders" icon={ShoppingCart} label="Order History" />
                </nav>

                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <LogOut size={18} />
                    Sign Out
                </button>
            </aside>

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Summary />} />
                    <Route path="/storefront" element={<Storefront />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/orders" element={<Orders />} />
                </Routes>
            </main>
        </div>
    );
}

function Summary() {
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, customers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, ordRes, custRes] = await Promise.all([
                    apiClient.get('/products/'),
                    apiClient.get('/orders/'),
                    apiClient.get('/customers/')
                ]);

                const totalRev = ordRes.data.reduce((acc: number, val: any) => acc + parseFloat(val.total_amount), 0);

                setStats({
                    products: prodRes.data.length,
                    orders: ordRes.data.length,
                    revenue: totalRev,
                    customers: custRes.data.length
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><Loader2 className="animate-spin" color="var(--primary)" size={40} /></div>;

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Monitor your multi-tenant inventory performance.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Global Clients</h3>
                    <p style={{ fontSize: '32px', fontWeight: 700 }}>{stats.customers}</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Products</h3>
                    <p style={{ fontSize: '32px', fontWeight: 700 }}>{stats.products}</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Active Orders</h3>
                    <p style={{ fontSize: '32px', fontWeight: 700 }}>{stats.orders}</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--primary)', filter: 'blur(40px)', opacity: 0.2 }}></div>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Revenue</h3>
                    <p style={{ fontSize: '32px', fontWeight: 700 }}>${stats.revenue.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}

function Storefront() {
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Cart State
    const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');

    const fetchData = async () => {
        try {
            const [prodRes, custRes] = await Promise.all([
                apiClient.get('/products/'),
                apiClient.get('/customers/')
            ]);
            setProducts(prodRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock_quantity) return prev;
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            if (product.stock_quantity < 1) return prev;
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Cart is empty');
        try {
            await apiClient.post('/orders/', {
                customer_id: selectedCustomer ? parseInt(selectedCustomer) : null,
                items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity }))
            });
            alert('Order placed successfully!');
            setCart([]);
            fetchData(); // refresh stocks
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error processing checkout');
        }
    };

    const cartTotal = cart.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Storefront Point-Of-Sale</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Browse available core products and seamlessly add them to the cart payload.</p>

                {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--text-muted)" size={32} /></div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                        {/* product cards with add button */}
                        {products.map(p => (
                            <div key={p.id} className="glass-panel animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                                    <Package2 size={48} color="var(--text-muted)" opacity={0.3} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>{p.name}</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>${parseFloat(p.price).toFixed(2)}</p>
                                </div>
                                <button onClick={() => addToCart(p)} disabled={p.stock_quantity < 1} className="btn btn-secondary" style={{ width: '100%', padding: '10px' }}>
                                    {p.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="glass-panel" style={{ width: '350px', padding: '24px', position: 'sticky', top: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingBag size={20} /> Checkout Cart</h2>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Map to Customer (Optional)</label>
                    <select className="input" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                        <option value="">-- Guest Checkout --</option>
                        {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                    {cart.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>Cart is currently empty</p> :
                        cart.map(item => (
                            <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>{item.product.name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.quantity} x ${parseFloat(item.product.price).toFixed(2)}</p>
                                </div>
                                <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                            </div>
                        ))
                    }
                </div>

                <div style={{ paddingTop: '16px', borderTop: '2px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Checkout:</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>${cartTotal.toFixed(2)}</span>
                </div>

                <button onClick={handleCheckout} disabled={cart.length === 0} className="btn btn-primary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
                    Process Standard Checkout
                </button>
            </div>
        </div>
    );
}

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const fetchCustomers = async () => {
        try {
            const res = await apiClient.get('/customers/');
            setCustomers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/customers/', { name, email: email || null, phone: phone || null });
            setIsCreating(false);
            setName(''); setEmail(''); setPhone('');
            setLoading(true);
            fetchCustomers();
        } catch (err) {
            console.error(err);
            alert('Error creating customer');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this customer?')) return;
        try {
            await apiClient.delete(`/customers/${id}`);
            fetchCustomers();
        } catch (err) {
            alert('Could not delete');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'white' }}>Customers</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage client directory mapping cleanly to your tenant.</p>
                </div>
                <button onClick={() => setIsCreating(!isCreating)} className="btn btn-primary" style={{ padding: '12px 24px' }}>
                    <Plus size={16} /> {isCreating ? 'Cancel' : 'Add Customer'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Customer Name</label>
                        <input required className="input" placeholder="e.g. Acme Corp" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div style={{ width: '250px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Email Address</label>
                        <input type="email" className="input" placeholder="test@acme.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div style={{ width: '150px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Phone Number</label>
                        <input type="text" className="input" placeholder="(123) 456-7890" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', height: '45px' }}>Save</button>
                </form>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--text-muted)" size={32} /></div>
            ) : customers.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                    <Users size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '16px', margin: '0 auto' }} />
                    <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>No clients found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Get started by adding your first client connection.</p>
                </div>
            ) : (
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>ID</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>Client</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>Contact</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c: any) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-muted)' }}>#{c.id}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500 }}>{c.name}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-muted)' }}>{c.email || 'N/A'}<br />{c.phone || ''}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(c.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--accent)' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    const fetchProducts = async () => {
        try {
            const res = await apiClient.get('/products/');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/products/', {
                name,
                price: parseFloat(price),
                stock_quantity: parseInt(stock, 10),
                description: ""
            });
            setIsCreating(false);
            setName(''); setPrice(''); setStock('');
            setLoading(true);
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert('Error creating product');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this product?')) return;
        try {
            await apiClient.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            alert('Could not delete');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'white' }}>Products Directory</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage inventory securely mapped to your tenant.</p>
                </div>
                <button onClick={() => setIsCreating(!isCreating)} className="btn btn-primary" style={{ padding: '12px 24px' }}>
                    <Plus size={16} /> {isCreating ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Product Name</label>
                        <input required className="input" placeholder="e.g. Wireless Keyboard" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div style={{ width: '150px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Unit Price ($)</label>
                        <input required type="number" step="0.01" className="input" placeholder="49.99" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                    <div style={{ width: '150px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Stock Qty</label>
                        <input required type="number" className="input" placeholder="100" value={stock} onChange={e => setStock(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', height: '45px' }}>Save</button>
                </form>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--text-muted)" size={32} /></div>
            ) : products.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                    <Package2 size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '16px', margin: '0 auto' }} />
                    <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>No products found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Get started by adding your first product to the inventory.</p>
                </div>
            ) : (
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>ID</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>Name</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>Price</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>Stock</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p: any) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-muted)' }}>#{p.id}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500 }}>{p.name}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>${parseFloat(p.price).toFixed(2)}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                                        <span style={{ background: p.stock_quantity > 10 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: p.stock_quantity > 10 ? 'var(--secondary)' : 'var(--accent)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                            {p.stock_quantity} in stock
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(p.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--accent)' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function Orders() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [quantity, setQuantity] = useState('1');

    const fetchData = async () => {
        try {
            const [ordRes, prodRes, custRes] = await Promise.all([
                apiClient.get('/orders/'),
                apiClient.get('/products/'),
                apiClient.get('/customers/')
            ]);
            setOrders(ordRes.data);
            setProducts(prodRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return alert('Select a product');
        try {
            await apiClient.post('/orders/', {
                customer_id: selectedCustomer ? parseInt(selectedCustomer) : null,
                items: [
                    { product_id: parseInt(selectedProduct), quantity: parseInt(quantity) }
                ]
            });
            setIsCreating(false);
            setSelectedProduct(''); setSelectedCustomer(''); setQuantity('1');
            setLoading(true);
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.detail || 'Error creating order');
        }
    };

    const getCustomerName = (id: number) => {
        if (!id) return 'Guest Account';
        const c: any = customers.find((cust: any) => cust.id === id);
        return c ? c.name : 'Unknown';
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'white' }}>Historical Orders Log</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track point of sale activities.</p>
                </div>
                <button onClick={() => setIsCreating(!isCreating)} className="btn btn-primary" style={{ padding: '12px 24px' }}>
                    <Plus size={16} /> {isCreating ? 'Cancel' : 'New Single Order'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Select Client</label>
                        <select className="input" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                            <option value="">-- Guest Order --</option>
                            {customers.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Select Product</label>
                        <select required className="input" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                            <option value="">-- Choose Product --</option>
                            {products.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name} (${parseFloat(p.price).toFixed(2)} | Stock: {p.stock_quantity})</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ width: '100px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>QTY</label>
                        <input required type="number" min="1" className="input" value={quantity} onChange={e => setQuantity(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', height: '45px' }}>Place Order</button>
                </form>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--text-muted)" size={32} /></div>
            ) : orders.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                    <ShoppingCart size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '16px', margin: '0 auto' }} />
                    <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px' }}>No orders yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Orders will appear here once sales are processed.</p>
                </div>
            ) : (
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>Order ID</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>Client</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>Date</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px' }}>Status</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '13px', textAlign: 'right' }}>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o: any) => (
                                <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500 }}>#{o.id}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-main)' }}>{getCustomerName(o.customer_id)}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                                        <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>${parseFloat(o.total_amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
