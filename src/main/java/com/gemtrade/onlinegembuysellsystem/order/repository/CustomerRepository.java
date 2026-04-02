package com.gemtrade.onlinegembuysellsystem.order.repository;
import com.gemtrade.onlinegembuysellsystem.order.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
