package com.gemtrade.onlinegembuysellsystem.order.service;

import com.gemtrade.onlinegembuysellsystem.order.dto.CustomerDTO;
import com.gemtrade.onlinegembuysellsystem.order.entity.Customer;
import com.gemtrade.onlinegembuysellsystem.order.repository.CustomerRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    public Customer saveCustomer(CustomerDTO dto) {
        Customer customer = new Customer();
        BeanUtils.copyProperties(dto, customer);
        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
}