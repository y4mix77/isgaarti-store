package com.isga.boutique.repositories;

import com.isga.boutique.models.VendeurOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendeurOperationRepository extends JpaRepository<VendeurOperation, Long> {
    List<VendeurOperation> findTop50ByVendeurIdOrderByCreatedAtDesc(Long vendeurId);
}
