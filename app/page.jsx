"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, User, Package, Search, Plus, Trash2, LogOut, Home } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

export default function TechMarketApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/orders/user/${currentUser.userId}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Siparişler yüklenemedi:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    }
  }, [currentUser, loadOrders]);

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Kategoriler yüklenemedi:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Ürünler yüklenemedi:', err);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        setCurrentPage('home');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Giriş hatası:', err);
      return false;
    }
  };

  const handleRegister = async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Kayıt hatası:', err);
      return false;
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product.productId === product.productId);
    if (existing) {
      setCart(cart.map(item =>
        item.product.productId === product.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (cart.length >= 10) {
        alert('Sepette maksimum 10 farklı ürün olabilir!');
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
    alert('Ürün sepete eklendi!');
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.productId !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product.productId === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async (shippingAddress) => {
    if (!currentUser) {
      alert('Lütfen önce giriş yapın!');
      return;
    }

    const total = calculateTotal();
    if (total < 50) {
      alert('Minimum sipariş tutarı 50 TL olmalıdır!');
      return;
    }

    try {
      const orderData = {
        userId: currentUser.userId,
        totalAmount: total,
        shippingAddress: shippingAddress,
        items: cart.map(item => ({
          productId: item.product.productId,
          quantity: item.quantity
        }))
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert('Sipariş başarıyla oluşturuldu!');
        setCart([]);
        loadProducts();
        loadOrders();
        setCurrentPage('orders');
      } else {
        alert('Sipariş oluşturulamadı!');
      }
    } catch (err) {
      console.error('Sipariş hatası:', err);
      alert('Sipariş oluşturulurken bir hata oluştu!');
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productData,
          sellerId: currentUser.userId
        })
      });
      if (res.ok) {
        alert('Ürün başarıyla eklendi!');
        loadProducts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Ürün ekleme hatası:', err);
      return false;
    }
  };

  const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      userType: 'ALICI'
    });

    const handleSubmit = async () => {
      if (isRegister) {
        const success = await handleRegister(formData);
        if (success) {
          alert('Kayıt başarılı! Giriş yapabilirsiniz.');
          setIsRegister(false);
        } else {
          alert('Kayıt başarısız!');
        }
      } else {
        const success = await handleLogin(formData.email, formData.password);
        if (!success) {
          alert('Giriş başarısız!');
        }
      }
    };

    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black-800 mb-2">TechMarket</h1>
            <p className="text-black-600">{isRegister ? 'Yeni Hesap Oluştur' : 'Giriş Yap'}</p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input
              type="password"
              placeholder="Şifre"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />

            {isRegister && (
              <>
                <input
                  type="text"
                  placeholder="Ad"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Soyad"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
                <input
                  type="tel"
                  placeholder="Telefon"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <textarea
                  placeholder="Adres"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="2"
                />
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.userType}
                  onChange={(e) => setFormData({...formData, userType: e.target.value})}
                >
                  <option value="ALICI">Alıcı</option>
                  <option value="SATICI">Satıcı</option>
                  <option value="HER_IKISI">Her İkisi</option>
                </select>
              </>
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </div>

          <p className="text-center mt-4 text-black-600">
            {isRegister ? 'Hesabınız var mı?' : 'Hesabınız yok mu?'}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 text-blue-600 font-semibold hover:underline"
            >
              {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </p>
        </div>
      </div>
    );
  };

  const ProductCard = ({ product }) => {
    const canBuy = currentUser && currentUser.userType !== 'SATICI';
    
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
        <div className="h-48 bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <Package className="w-20 h-20 text-white opacity-50" />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 truncate">{product.name}</h3>
          <p className="text-black-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-2xl font-bold text-blue-600">{product.price} ₺</span>
            <span className="text-sm text-black-500">Stok: {product.stock}</span>
          </div>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0 || !canBuy}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {!canBuy ? 'Satıcılar Alamaz' : 
             product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    );
  };

  const HomePage = () => {
    const filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black-800 mb-4">Ürünler</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-black-400" />
            <input
              type="text"
              placeholder="Ürün ara..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-black-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Ürün bulunamadı</p>
          </div>
        )}
      </div>
    );
  };

  const CartPage = () => {
    const [address, setAddress] = useState(currentUser?.address || '');

    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-black-800 mb-6">Sepetim</h2>

        {cart.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-black-400" />
            <p className="text-black-600">Sepetiniz boş</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              {cart.map(item => (
                <div key={item.product.productId} className="flex items-center justify-between py-4 border-b last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-black-600">{item.product.price} ₺</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.product.productId, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.productId, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold w-24 text-right">{(item.product.price * item.quantity).toFixed(2)} ₺</span>
                    <button
                      onClick={() => removeFromCart(item.product.productId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <label className="block font-semibold mb-2">Teslimat Adresi</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Teslimat adresinizi girin..."
                />
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold">Toplam:</span>
                <span className="text-3xl font-bold text-blue-600">{calculateTotal().toFixed(2)} ₺</span>
              </div>
              <button
                onClick={() => handleCheckout(address)}
                disabled={!address || calculateTotal() < 50}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-300"
              >
                Siparişi Tamamla
              </button>
              {calculateTotal() < 50 && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  Minimum sipariş tutarı 50 TL olmalıdır
                </p>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const OrdersPage = () => (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-black-800 mb-6">Siparişlerim</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <Package className="w-16 h-16 mx-auto mb-4 text-black-400" />
          <p className="text-black-600">Henüz siparişiniz yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.orderId} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Sipariş #{order.orderId}</h3>
                  <p className="text-black-600 text-sm">
                    {new Date(order.orderDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{order.totalAmount} ₺</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    order.status === 'TESLIM_EDILDI' ? 'bg-green-100 text-green-800' :
                    order.status === 'ONAYLANDI' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'IPTAL' ? 'bg-red-100 text-red-800' :
                    order.status === 'KARGODA' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-black-800'
                  }`}>
                    {order.status === 'BEKLEMEDE' ? 'Beklemede' :
                     order.status === 'ONAYLANDI' ? 'Onaylandı' :
                     order.status === 'KARGODA' ? 'Kargoda' :
                     order.status === 'TESLIM_EDILDI' ? 'Teslim Edildi' :
                     order.status === 'IPTAL' ? 'İptal Edildi' : order.status}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-black-700"><strong>Teslimat Adresi:</strong> {order.shippingAddress}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ManageOrdersPage = () => {
    const [allOrders, setAllOrders] = useState([]);

    useEffect(() => {
      loadAllOrders();
    }, []);

    const loadAllOrders = async () => {
      try {
        // Satıcının sadece kendi ürünlerinin siparişlerini getir
        const res = await fetch(`${API_BASE}/orders/seller/${currentUser.userId}`);
        const data = await res.json();
        setAllOrders(data);
      } catch (err) {
        console.error('Siparişler yüklenemedi:', err);
      }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
      try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
          loadAllOrders();
        }
      } catch (err) {
        console.error('Sipariş durumu güncellenemedi:', err);
      }
    };

    return (
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-black-800 mb-6">Sipariş Yönetimi</h2>

        {allOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <Package className="w-16 h-16 mx-auto mb-4 text-black-400" />
            <p className="text-black-600">Henüz sipariş yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allOrders.map(order => (
              <div key={order.orderId} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Sipariş #{order.orderId}</h3>
                    <p className="text-black-600 text-sm">
                      Müşteri: {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-black-600 text-sm">
                      {new Date(order.orderDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{order.totalAmount} ₺</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'TESLIM_EDILDI' ? 'bg-green-100 text-green-800' :
                      order.status === 'ONAYLANDI' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'IPTAL' ? 'bg-red-100 text-red-800' :
                      order.status === 'KARGODA' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-black-800'
                    }`}>
                      {order.status === 'BEKLEMEDE' ? 'Beklemede' :
                       order.status === 'ONAYLANDI' ? 'Onaylandı' :
                       order.status === 'KARGODA' ? 'Kargoda' :
                       order.status === 'TESLIM_EDILDI' ? 'Teslim Edildi' :
                       order.status === 'IPTAL' ? 'İptal Edildi' : order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="text-black-700 mb-2"><strong>Teslimat Adresi:</strong> {order.shippingAddress}</p>
                  {order.items && order.items.length > 0 && (
                    <div>
                      <strong>Ürünler:</strong>
                      <ul className="mt-2 space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="text-sm text-black-600">
                            {item.product?.name} - {item.quantity} adet - {item.subtotal} ₺
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {order.status === 'BEKLEMEDE' && (
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'ONAYLANDI')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'IPTAL')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      İptal Et
                    </button>
                  </div>
                )}

                {order.status === 'ONAYLANDI' && (
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'KARGODA')}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                    >
                      Kargoya Ver
                    </button>
                  </div>
                )}

                {order.status === 'KARGODA' && (
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'TESLIM_EDILDI')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Teslim Edildi
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const AddProductPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      imageUrl: ''
    });

    const handleSubmit = async () => {
      const success = await handleAddProduct(formData);
      if (success) {
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          categoryId: '',
          imageUrl: ''
        });
      }
    };

    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-black-800 mb-6">Yeni Ürün Ekle</h2>
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div>
            <label className="block font-semibold mb-2">Ürün Adı</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Açıklama</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Fiyat (₺)</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Stok</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-2">Kategori</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            >
              <option value="">Kategori Seçin</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Görsel URL (opsiyonel)</label>
            <input
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Ürünü Ekle
          </button>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return <LoginPage />;
  }

  const isSeller = currentUser.userType === 'SATICI' || currentUser.userType === 'HER_IKISI';
  const isBuyer = currentUser.userType === 'ALICI' || currentUser.userType === 'HER_IKISI';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">TechMarket</h1>
          <nav className="flex gap-6 items-center">
            <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 hover:text-blue-600">
              <Home className="w-5 h-5" />
              Anasayfa
            </button>
            
            {/* ALICI ve HER_IKISI sepet ve sipariş görebilir */}
            {isBuyer && (
              <>
                <button onClick={() => setCurrentPage('cart')} className="flex items-center gap-2 hover:text-blue-600 relative">
                  <ShoppingCart className="w-5 h-5" />
                  Sepet
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
                <button onClick={() => setCurrentPage('orders')} className="flex items-center gap-2 hover:text-blue-600">
                  <Package className="w-5 h-5" />
                  Siparişlerim
                </button>
              </>
            )}
            
            {/* SATICI ve HER_IKISI ürün ekleyebilir ve sipariş yönetir */}
            {isSeller && (
              <>
                <button onClick={() => setCurrentPage('add-product')} className="flex items-center gap-2 hover:text-blue-600">
                  <Plus className="w-5 h-5" />
                  Ürün Ekle
                </button>
                <button onClick={() => setCurrentPage('manage-orders')} className="flex items-center gap-2 hover:text-blue-600">
                  <Package className="w-5 h-5" />
                  Sipariş Yönetimi
                </button>
              </>
            )}
            
            <div className="flex items-center gap-2 ml-4">
              <User className="w-5 h-5" />
              <span className="font-semibold">{currentUser.firstName}</span>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setCart([]);
                  setCurrentPage('home');
                }}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="py-6">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'cart' && isBuyer && <CartPage />}
        {currentPage === 'orders' && isBuyer && <OrdersPage />}
        {currentPage === 'add-product' && isSeller && <AddProductPage />}
        {currentPage === 'manage-orders' && isSeller && <ManageOrdersPage />}
      </main>
    </div>
  );
}