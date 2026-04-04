package com.gemtrade.onlinegembuysellsystem.cart.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.List;

import com.gemtrade.onlinegembuysellsystem.order.entity.Customer;

// DELETE THIS LINE: import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@Entity
@Table(name = "cart")
@Getter
@Setter
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Long cartId;

    // FIX: Change 'this.id' to 'this.cartId'
    public Long getId() {
        return this.cartId;
    }

    // 2. PLACE THE RELATIONSHIP HERE (above the status)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ADD THIS: This links the Cart to its items
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CartItem> cartItems;
}