package com.ledgerco.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanRequest {

    @NotBlank
    private String bankName;

    @NotBlank
    private String borrowerName;

    @Positive
    private int principal;

    @Positive
    private int years;

    @DecimalMin(value = "0.0", inclusive = false)
    private double rate;
}
