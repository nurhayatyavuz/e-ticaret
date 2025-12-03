package com.techmarket.controller;

import com.techmarket.model.Product;
import com.techmarket.repository.ProductRepository;
import com.techmarket.repository.UserRepository;
import com.techmarket.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findByIsActiveTrue();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String keyword) {
        return productRepository.searchProducts(keyword);
    }
    
    @GetMapping("/category/{categoryId}")
    public List<Product> getProductsByCategory(@PathVariable Long categoryId) {
        return productRepository.findByCategory_CategoryId(categoryId);
    }
    
    @GetMapping("/seller/{sellerId}")
    public List<Product> getProductsBySeller(@PathVariable Long sellerId) {
        return productRepository.findBySeller_UserId(sellerId);
    }
    
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        return userRepository.findById(request.getSellerId())
                .flatMap(seller -> categoryRepository.findById(request.getCategoryId())
                        .map(category -> {
                            Product product = new Product();
                            product.setSeller(seller);
                            product.setCategory(category);
                            product.setName(request.getName());
                            product.setDescription(request.getDescription());
                            product.setPrice(request.getPrice());
                            product.setStock(request.getStock());
                            product.setImageUrl(request.getImageUrl());
                            product.setIsActive(true);
                            
                            Product saved = productRepository.save(product);
                            return ResponseEntity.ok(saved);
                        }))
                .orElse(ResponseEntity.badRequest().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(request.getName());
                    product.setDescription(request.getDescription());
                    product.setPrice(request.getPrice());
                    product.setStock(request.getStock());
                    product.setImageUrl(request.getImageUrl());
                    product.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(productRepository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setIsActive(false);
                    productRepository.save(product);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

class ProductRequest {
    private Long sellerId;
    private Long categoryId;
    private String name;
    private String description;
    private java.math.BigDecimal price;
    private Integer stock;
    private String imageUrl;
    
    // Getters and Setters
    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public java.math.BigDecimal getPrice() { return price; }
    public void setPrice(java.math.BigDecimal price) { this.price = price; }
    
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}