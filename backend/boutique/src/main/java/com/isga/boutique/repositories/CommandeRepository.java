package com.isga.boutique.repositories;

import com.isga.boutique.models.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {
    // For the Client: Load their specific order history in their dashboard
    List<Commande> findByClientId(Long clientId);
    
    // For the Admin/Vendeur: Find an order by its tracking number
    Optional<Commande> findByNumeroCommande(String numeroCommande);

    Optional<Commande> findByStripeSessionId(String stripeSessionId);

    Optional<Commande> findByStripePaymentIntentId(String stripePaymentIntentId);
}
