package com.isga.boutique.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Promotion extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal pourcentageRemise;

    private boolean isGlobal = false;

    private java.time.LocalDate dateDebut;
    private java.time.LocalDate dateFin;

    private boolean active = true;
    
    private String code;

    private String cibleType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id")
    private Produit produitConcerne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorieConcernee;
}
