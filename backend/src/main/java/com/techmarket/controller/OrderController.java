package com.techmarket.controller;

import com.techmarket.model.*;
import com.techmarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.transaction.Transactional;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    @GetMapping("/seller/{sellerId}")
    public List<Order> getOrdersBySeller(@PathVariable Long sellerId) {
        return orderRepository.findOrdersBySellerId(sellerId);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable Long userId) {
        return orderRepository.findByUser_UserIdOrderByOrderDateDesc(userId);
    }
    
    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Order must contain at least one item");
            }

            return userRepository.findById(request.getUserId())
                    .map(user -> {
                        if (request.getTotalAmount() == null) {
                            return ResponseEntity.badRequest().body("Total amount is required");
                        }

                        if (request.getTotalAmount().compareTo(new BigDecimal("50")) < 0) {
                            return ResponseEntity.badRequest()
                                    .body("Minimum sipariş tutarı 50 TL olmalıdır");
                        }

                        Order order = new Order();
                        order.setUser(user);
                        order.setTotalAmount(request.getTotalAmount());
                        order.setShippingAddress(request.getShippingAddress());
                        order.setStatus(OrderStatus.BEKLEMEDE);

                        List<OrderItem> items = new ArrayList<>();
                        BigDecimal computedTotal = BigDecimal.ZERO;

                        for (OrderItemRequest itemReq : request.getItems()) {
                            if (itemReq == null || itemReq.getProductId() == null || itemReq.getQuantity() == null) {
                                throw new IllegalArgumentException("Invalid order item");
                            }

                            var optProduct = productRepository.findById(itemReq.getProductId());
                            if (optProduct.isEmpty()) {
                                throw new IllegalArgumentException("Product not found: " + itemReq.getProductId());
                            }
                            var product = optProduct.get();
                            if (product.getStock() < itemReq.getQuantity()) {
                                throw new IllegalArgumentException("Insufficient stock for product: " + product.getProductId());
                            }

                            OrderItem item = new OrderItem();
                            item.setOrder(order);
                            item.setProduct(product);
                            item.setQuantity(itemReq.getQuantity());
                            item.setPriceAtPurchase(product.getPrice());
                            BigDecimal lineSubtotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
                            item.setSubtotal(lineSubtotal);
                            items.add(item);

                            // decrease stock
                            product.setStock(product.getStock() - itemReq.getQuantity());
                            productRepository.save(product);

                            computedTotal = computedTotal.add(lineSubtotal);
                        }

                        // optional: verify totals match
                        if (computedTotal.compareTo(request.getTotalAmount()) != 0) {
                            logger.warn("Computed total {} does not match client total {}", computedTotal, request.getTotalAmount());
                            // proceed but set authoritative total
                            order.setTotalAmount(computedTotal);
                        }

                        order.setItems(items);
                        Order saved = orderRepository.save(order);
                        return ResponseEntity.ok(saved);
                    })
                    .orElse(ResponseEntity.badRequest().body("User not found"));
        } catch (IllegalArgumentException ex) {
            logger.warn("Order creation failed: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (Exception ex) {
            logger.error("Unexpected error while creating order", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Server error creating order");
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, 
                                                    @RequestBody StatusRequest request) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(request.getStatus());
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    public static class OrderRequest {
        private Long userId;
        private BigDecimal totalAmount;
        private String shippingAddress;
        private List<OrderItemRequest> items;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        
        public String getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
        
        public List<OrderItemRequest> getItems() { return items; }
        public void setItems(List<OrderItemRequest> items) { this.items = items; }
    }
    
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
    
    public static class StatusRequest {
        private OrderStatus status;
        
        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
    }

}

class OrderRequest {
    private Long userId;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private List<OrderItemRequest> items;
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}

class OrderItemRequest {
    private Long productId;
    private Integer quantity;
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}

class StatusRequest {
    private OrderStatus status;
    
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
}