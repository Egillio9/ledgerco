package com.ledgerco.db.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class LoanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bankName;
    private String borrowerName;

    private int principal;
    private int years;
    private double rate;

    private double totalInterest;
    private double totalAmount;
    private double emi;
    private int totalMonths;
}
