package com.techmarket.repository;

import com.techmarket.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySeller_UserId(Long sellerId);
    List<Product> findByCategory_CategoryId(Long categoryId);
    List<Product> findByIsActiveTrue();
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', ?1, '%')))")
    List<Product> searchProducts(String keyword);
}