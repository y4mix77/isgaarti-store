package com.isga.boutique.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categorie_operations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategorieOperation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    private Long categorieId;

    @Column(nullable = false)
    private String categorieNom;
}
