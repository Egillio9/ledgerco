package com.ledgerco.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInfo {

    private int amount;
    private int afterEmi;
}
