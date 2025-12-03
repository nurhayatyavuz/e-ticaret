package com.techmarket.repository;

import com.techmarket.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser_UserId(Long userId);
    List<Order> findByUser_UserIdOrderByOrderDateDesc(Long userId);
    
    @Query("SELECT DISTINCT o FROM Order o JOIN o.items oi JOIN oi.product p WHERE p.seller.userId = :sellerId ORDER BY o.orderDate DESC")
    List<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId);
}