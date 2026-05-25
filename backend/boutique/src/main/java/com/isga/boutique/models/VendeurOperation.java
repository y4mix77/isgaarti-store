package com.isga.boutique.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vendeur_operations")
@Getter
@Setter
@NoArgsConstructor
public class VendeurOperation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long vendeurId;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String event;

    @Column(columnDefinition = "TEXT")
    private String meta;

    public VendeurOperation(Long vendeurId, String category, String event, String meta) {
        this.vendeurId = vendeurId;
        this.category = category;
        this.event = event;
        this.meta = meta;
    }
}
