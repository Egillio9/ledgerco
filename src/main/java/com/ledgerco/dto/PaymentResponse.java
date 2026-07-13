package com.ledgerco.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private String bankName;
    private String borrowerName;

    private int amount;
    private int afterEmi;
    private String message;
}