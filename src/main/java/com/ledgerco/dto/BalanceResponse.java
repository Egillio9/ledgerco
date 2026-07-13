package com.ledgerco.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BalanceResponse {

    private String bankName;
    private String borrowerName;

    private int amountPaid;
    private int emisLeft;
}
