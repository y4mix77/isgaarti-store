package com.isga.boutique.controllers;

import com.isga.boutique.models.Commande;
import com.isga.boutique.models.LigneCommande;
import com.isga.boutique.models.Produit;
import com.isga.boutique.models.User;
import com.isga.boutique.repositories.CommandeRepository;
import com.isga.boutique.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/commandes")
public class CommandeController {

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/mes-commandes")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> getMyOrders(Principal principal) {
        User client = currentUser(principal);
        List<Map<String, Object>> orders = commandeRepository.findByClientId(client.getId()).stream()
                .sorted((a, b) -> safeDate(b.getCreatedAt()).compareTo(safeDate(a.getCreatedAt())))
                .map(this::mapOrder)
                .toList();
        return ResponseEntity.ok(orders);
    }

    private Map<String, Object> mapOrder(Commande commande) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", commande.getId());
        dto.put("orderNumber", commande.getNumeroCommande());
        dto.put("status", commande.getStatut());
        dto.put("paymentStatus", commande.getPaymentStatus());
        dto.put("total", safeMoney(commande.getTotal()));
        dto.put("subtotal", safeMoney(commande.getSubtotal()));
        dto.put("shippingCost", safeMoney(commande.getShippingCost()));
        dto.put("taxAmount", safeMoney(commande.getTaxAmount()));
        dto.put("promoDiscount", safeMoney(commande.getPromoDiscount()));
        dto.put("promoCode", commande.getPromoCode());
        dto.put("clientName", commande.getClientName());
        dto.put("clientEmail", commande.getClientEmail());
        dto.put("shippingPhone", commande.getShippingPhone());
        dto.put("shippingAddress", commande.getShippingAddress());
        dto.put("shippingCity", commande.getShippingCity());
        dto.put("shippingCountry", commande.getShippingCountry());
        dto.put("createdAt", commande.getCreatedAt());
        dto.put("updatedAt", commande.getUpdatedAt());
        dto.put("items", commande.getLignes().stream().map(this::mapLine).toList());
        return dto;
    }

    private Map<String, Object> mapLine(LigneCommande ligne) {
        Produit product = ligne.getProduit();
        BigDecimal unitPrice = safeMoney(ligne.getPrixUnitaire());
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(ligne.getQuantite() == null ? 0 : ligne.getQuantite()));
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", ligne.getId());
        dto.put("productId", product != null ? product.getId() : null);
        dto.put("name", product != null ? product.getNom() : "Produit");
        dto.put("image", product != null ? product.getImage() : null);
        dto.put("quantity", ligne.getQuantite());
        dto.put("unitPrice", unitPrice);
        dto.put("lineTotal", lineTotal);
        dto.put("fulfillmentStatus", normalizeStatus(ligne.getFulfillmentStatus()));
        dto.put("vendorName", product != null && product.getVendeur() != null ? product.getVendeur().getNom() : "Vendeur");
        return dto;
    }

    private User currentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));
    }

    private LocalDateTime safeDate(LocalDateTime date) {
        return date != null ? date : LocalDateTime.MIN;
    }

    private BigDecimal safeMoney(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private String normalizeStatus(String status) {
        return status == null || status.isBlank() ? "PREPARATION" : status;
    }
}
