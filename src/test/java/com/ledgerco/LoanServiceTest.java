package com.ledgerco;

import com.ledgerco.dto.BalanceResponse;
import com.ledgerco.dto.LoanRequest;
import com.ledgerco.dto.LoanResponse;
import com.ledgerco.exception.InvalidInputException;
import com.ledgerco.db.entity.LoanEntity;
import com.ledgerco.db.entity.PaymentEntity;
import com.ledgerco.db.repository.LoanRepository;
import com.ledgerco.db.repository.PaymentRepository;
import com.ledgerco.service.LoanService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock private LoanRepository loanRepository;
    @Mock private PaymentRepository paymentRepository;
    @InjectMocks private LoanService loanService;

    private LoanEntity buildLoan(Long id, String bank, String borrower,
                                 double total, int months, int emi) {
        LoanEntity loan = new LoanEntity();
        loan.setId(id);
        loan.setBankName(bank);
        loan.setBorrowerName(borrower);
        loan.setTotalAmount(total);
        loan.setTotalMonths(months);
        loan.setEmi(emi);
        return loan;
    }

    @Test
    void testCreateLoanCalculatesAmounts() {
        LoanRequest request = new LoanRequest("IDIDI", "Dale", 10000, 5, 4);

        when(loanRepository.existsByBankNameAndBorrowerName("IDIDI", "Dale"))
            .thenReturn(false);
        when(loanRepository.save(any(LoanEntity.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        LoanResponse result = loanService.createLoan(request);

        assertEquals(2000.0, result.getTotalInterest());
        assertEquals(12000.0, result.getTotalAmount());
        assertEquals(200.0, result.getEmi());
        assertEquals(60, result.getTotalMonths());
    }

    @Test
    void testBalanceWithLumpSum() {
        // LOAN IDIDI Dale 10000 5 4
        // I = 10000*5*4/100 = 2000, A = 12000, EMI = ceil(12000/60) = 200
        LoanEntity loan = buildLoan(1L, "IDIDI", "Dale", 12000.0, 60, 200);

        PaymentEntity lump = new PaymentEntity();
        lump.setAmount(5000);
        lump.setAfterEmi(3);

        when(loanRepository.findByBankNameAndBorrowerName("IDIDI", "Dale"))
            .thenReturn(Optional.of(loan));
        when(paymentRepository.findByLoanIdAndAfterEmiLessThanEqual(1L, 5))
            .thenReturn(List.of(lump));

        BalanceResponse result = loanService.getBalance("IDIDI", "Dale", 5);

        // Month1:200, Month2:200, Month3:200+5000lump, Month4:200, Month5:200 = 6000
        assertEquals(6000L, result.getAmountPaid());
        // Remaining = 12000-6000=6000, EMIs left = ceil(6000/200) = 30
        assertEquals(30, result.getEmisLeft());
    }

    @Test
    void testBalanceAtZeroEmi() {
        LoanEntity loan = buildLoan(4L, "UON", "Shelly", 24000.0, 24, 1000);

        when(loanRepository.findByBankNameAndBorrowerName("UON", "Shelly"))
            .thenReturn(Optional.of(loan));
        when(paymentRepository.findByLoanIdAndAfterEmiLessThanEqual(4L, 0))
            .thenReturn(List.of());

        BalanceResponse result = loanService.getBalance("UON", "Shelly", 0);

        assertEquals(0, result.getAmountPaid());
        assertEquals(24, result.getEmisLeft());
    }

    @Test
    void testBalanceRejectsInvalidEmi() {
        LoanEntity loan = buildLoan(5L, "UON", "Shelly", 24000.0, 24, 1000);

        when(loanRepository.findByBankNameAndBorrowerName("UON", "Shelly"))
            .thenReturn(Optional.of(loan));

        assertThrows(
            InvalidInputException.class,
            () -> loanService.getBalance("UON", "Shelly", 25));
    }

    @Test
    void testBalanceWithoutLumpSum() {
        LoanEntity loan = buildLoan(2L, "MBI", "Harry", 12000.0, 60, 200);

        when(loanRepository.findByBankNameAndBorrowerName("MBI", "Harry"))
            .thenReturn(Optional.of(loan));
        when(paymentRepository.findByLoanIdAndAfterEmiLessThanEqual(2L, 12))
            .thenReturn(List.of());

        BalanceResponse result = loanService.getBalance("MBI", "Harry", 12);

        assertEquals(2400L, result.getAmountPaid()); // 200 * 12
        assertEquals(48, result.getEmisLeft());       // 60 - 12
    }

    @Test
    void testBalanceWhenFullyPaid() {
        LoanEntity loan = buildLoan(3L, "ABC", "John", 1000.0, 60, 200);

        PaymentEntity lump = new PaymentEntity();
        lump.setAmount(800);
        lump.setAfterEmi(1);

        when(loanRepository.findByBankNameAndBorrowerName("ABC", "John"))
            .thenReturn(Optional.of(loan));
        when(paymentRepository.findByLoanIdAndAfterEmiLessThanEqual(3L, 5))
            .thenReturn(List.of(lump));

        BalanceResponse result = loanService.getBalance("ABC", "John", 5);

        assertEquals(1000L, result.getAmountPaid());
        assertEquals(0, result.getEmisLeft());
    }
}
