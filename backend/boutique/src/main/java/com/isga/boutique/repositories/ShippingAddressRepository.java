package com.isga.boutique.repositories;

import com.isga.boutique.models.ShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {
    List<ShippingAddress> findByClientIdOrderByDefaultAddressDescUpdatedAtDesc(Long clientId);
}
