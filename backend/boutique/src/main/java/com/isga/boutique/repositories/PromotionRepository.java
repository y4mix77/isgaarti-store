package com.isga.boutique.repositories;

import com.isga.boutique.models.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    // For the Admin: Fetch only site-wide global promotions
    List<Promotion> findByIsGlobalTrue();
    
    // For the Vendeur: Fetch local promotions attached to specific products
    List<Promotion> findByProduitConcerneId(Long produitId);

    List<Promotion> findByCodeIgnoreCase(String code);
}
