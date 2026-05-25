package com.isga.boutique.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fournisseurs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Fournisseur extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, unique = true)
    private String email;

    private String telephone;

    private Integer latency; // Simulated for Node Latency Telemetry
}