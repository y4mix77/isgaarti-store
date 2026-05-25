package com.isga.boutique.repositories;

import com.isga.boutique.models.CategorieOperation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategorieOperationRepository extends JpaRepository<CategorieOperation, Long> {
    List<CategorieOperation> findTop8ByOrderByCreatedAtDesc();
}
