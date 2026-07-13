package com.ledgerco.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotBlank
    private String bankName;

    @NotBlank
    private String borrowerName;

    @Positive
    private int amount;

    @Positive
    private int afterEmi;
}
