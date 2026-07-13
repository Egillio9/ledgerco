package com.ledgerco.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanResponse {

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