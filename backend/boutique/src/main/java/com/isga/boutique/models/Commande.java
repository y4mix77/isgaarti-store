package com.isga.boutique.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commandes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Commande extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroCommande; // e.g., "CMD-2026-001"

    @Column(nullable = false)
    private String statut; // e.g., "EN_ATTENTE", "LIVREE", "ANNULEE"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal shippingCost;

    @Column(precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal promoDiscount;

    private String promoCode;

    @Column(unique = true)
    private String stripeSessionId;

    @Column(unique = true)
    private String stripePaymentIntentId;

    private String paymentStatus;

    private String clientName;

    private String clientEmail;

    private String shippingPhone;

    private String shippingAddress;

    private String shippingCity;

    private String shippingCountry;

    // We will link this to the User (Client) table when we build the security module
    @Column(name = "client_id", nullable = false)
    private Long clientId; 

    // 1-N Relationship: One order has many items
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneCommande> lignes = new ArrayList<>();
}
