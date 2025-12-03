package com.techmarket.controller;

import com.techmarket.model.*;
import com.techmarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Cart> getCartByUserId(@PathVariable Long userId) {
        Optional<Cart> cart = cartRepository.findByUser_UserId(userId);
        
        if (cart.isPresent()) {
            return ResponseEntity.ok(cart.get());
        } else {
            // Kullanıcının sepeti yoksa oluştur
            return userRepository.findById(userId)
                    .map(user -> {
                        Cart newCart = new Cart();
                        newCart.setUser(user);
                        Cart saved = cartRepository.save(newCart);
                        return ResponseEntity.ok(saved);
                    })
                    .orElse(ResponseEntity.notFound().build());
        }
    }
    
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request) {
        return userRepository.findById(request.getUserId())
                .flatMap(user -> productRepository.findById(request.getProductId())
                        .map(product -> {
                            // Kullanıcının sepetini bul veya oluştur
                            Cart cart = cartRepository.findByUser_UserId(user.getUserId())
                                    .orElseGet(() -> {
                                        Cart newCart = new Cart();
                                        newCart.setUser(user);
                                        return cartRepository.save(newCart);
                                    });
                            
                            // Ürün zaten sepette var mı kontrol et
                            Optional<CartItem> existingItem = cartItemRepository
                                    .findByCart_CartIdAndProduct_ProductId(cart.getCartId(), product.getProductId());
                            
                            if (existingItem.isPresent()) {
                                // Mevcut itemi güncelle
                                CartItem item = existingItem.get();
                                item.setQuantity(item.getQuantity() + request.getQuantity());
                                cartItemRepository.save(item);
                            } else {
                                // Yeni item ekle
                                CartItem newItem = new CartItem();
                                newItem.setCart(cart);
                                newItem.setProduct(product);
                                newItem.setQuantity(request.getQuantity());
                                cartItemRepository.save(newItem);
                            }
                            
                            // Cart'ın updatedAt'ini güncelle
                            cart.setUpdatedAt(LocalDateTime.now());
                            cartRepository.save(cart);
                            
                            return ResponseEntity.ok("Ürün sepete eklendi");
                        }))
                .orElse(ResponseEntity.badRequest().body("Kullanıcı veya ürün bulunamadı"));
    }
    
    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@RequestBody UpdateCartItemRequest request) {
        return cartItemRepository.findById(request.getCartItemId())
                .map(item -> {
                    if (request.getQuantity() <= 0) {
                        cartItemRepository.delete(item);
                        return ResponseEntity.ok("Ürün sepetten kaldırıldı");
                    } else {
                        item.setQuantity(request.getQuantity());
                        cartItemRepository.save(item);
                        
                        // Cart'ın updatedAt'ini güncelle
                        Cart cart = item.getCart();
                        cart.setUpdatedAt(LocalDateTime.now());
                        cartRepository.save(cart);
                        
                        return ResponseEntity.ok("Sepet güncellendi");
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartItemId) {
        return cartItemRepository.findById(cartItemId)
                .map(item -> {
                    Cart cart = item.getCart();
                    cartItemRepository.delete(item);
                    
                    // Cart'ın updatedAt'ini güncelle
                    cart.setUpdatedAt(LocalDateTime.now());
                    cartRepository.save(cart);
                    
                    return ResponseEntity.ok("Ürün sepetten kaldırıldı");
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        return cartRepository.findByUser_UserId(userId)
                .map(cart -> {
                    cartItemRepository.deleteAll(cart.getItems());
                    cart.getItems().clear();
                    cart.setUpdatedAt(LocalDateTime.now());
                    cartRepository.save(cart);
                    return ResponseEntity.ok("Sepet temizlendi");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

class AddToCartRequest {
    private Long userId;
    private Long productId;
    private Integer quantity;
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}

class UpdateCartItemRequest {
    private Long cartItemId;
    private Integer quantity;
    
    public Long getCartItemId() { return cartItemId; }
    public void setCartItemId(Long cartItemId) { this.cartItemId = cartItemId; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}