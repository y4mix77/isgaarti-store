package com.isga.boutique.repositories;

import com.isga.boutique.models.PanierItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PanierItemRepository extends JpaRepository<PanierItem, Long> {
    Optional<PanierItem> findByPanierIdAndProduitId(Long panierId, Long produitId);
}
