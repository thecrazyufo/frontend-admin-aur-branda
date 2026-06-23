package com.datamigratepro.repository;

import com.datamigratepro.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    Optional<Order> findByOrderId(String orderId);
    List<Order> findBySiteId(String siteId);
}
