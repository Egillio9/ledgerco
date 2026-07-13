package com.ledgerco.service;

import com.ledgerco.db.repository.LoanRepository;
import com.ledgerco.db.repository.PaymentRepository;
import com.ledgerco.dto.BalanceResponse;
import com.ledgerco.dto.LoanRequest;
import com.ledgerco.dto.LoanResponse;
import com.ledgerco.dto.PaymentInfo;
import com.ledgerco.dto.PaymentRequest;
import com.ledgerco.dto.PaymentResponse;
import com.ledgerco.exception.InvalidInputException;
import com.ledgerco.exception.LoanNotFoundException;
import com.ledgerco.db.entity.LoanEntity;
import com.ledgerco.db.entity.PaymentEntity;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

        private final LoanRepository loanRepository;
        private final PaymentRepository paymentRepository;

        @Transactional
        public LoanResponse createLoan(LoanRequest request) {

                boolean exists = loanRepository.existsByBankNameAndBorrowerName(
                                request.getBankName(),
                                request.getBorrowerName());

                if (exists) {
                        throw new InvalidInputException(
                                        "Loan already exists for borrower: "
                                                        + request.getBorrowerName());
                }

                double totalInterest = request.getPrincipal()
                                * request.getYears()
                                * request.getRate()
                                / 100.0;

                int totalMonths = request.getYears() * 12;
                double totalAmount = request.getPrincipal() + totalInterest;
                double emi = Math.ceil(totalAmount / totalMonths);

                LoanEntity loanEntity = LoanEntity.builder()
                                .bankName(request.getBankName())
                                .borrowerName(request.getBorrowerName())
                                .principal(request.getPrincipal())
                                .years(request.getYears())
                                .rate(request.getRate())
                                .totalInterest(totalInterest)
                                .totalAmount(totalAmount)
                                .emi(emi)
                                .totalMonths(totalMonths)
                                .build();

                LoanEntity savedLoan = loanRepository.save(loanEntity);

                return mapToLoanResponse(savedLoan);
        }

        public LoanResponse getLoan(
                        String bankName,
                        String borrowerName) {

                LoanEntity loan = findLoan(bankName, borrowerName);

                return mapToLoanResponse(loan);
        }

        public List<LoanResponse> getAllLoans() {
                return loanRepository.findAll()
                                .stream()
                                .map(this::mapToLoanResponse)
                                .toList();
        }

        public List<PaymentInfo> getLoanPayments(
                        String bankName,
                        String borrowerName) {

                LoanEntity loan = findLoan(bankName, borrowerName);

                return paymentRepository.findByLoanId(loan.getId())
                                .stream()
                                .map(this::mapToPaymentInfo)
                                .toList();
        }

        private PaymentInfo mapToPaymentInfo(PaymentEntity payment) {
                return PaymentInfo.builder()
                                .amount(payment.getAmount())
                                .afterEmi(payment.getAfterEmi())
                                .build();
        }

        public LoanEntity findLoan(
                        String bankName,
                        String borrowerName) {

                return loanRepository
                                .findByBankNameAndBorrowerName(
                                                bankName,
                                                borrowerName)
                                .orElseThrow(() -> new LoanNotFoundException(
                                                "Loan not found"));
        }

        @Transactional
        public PaymentResponse addPayment(
                        PaymentRequest request) {

                LoanEntity loan = findLoan(
                                request.getBankName(),
                                request.getBorrowerName());

                if (request.getAfterEmi() < 1 ||
                                request.getAfterEmi() > loan.getTotalMonths()) {

                        throw new InvalidInputException(
                                        "Invalid EMI number");
                }

                PaymentEntity payment = PaymentEntity.builder()
                                .loan(loan)
                                .amount(request.getAmount())
                                .afterEmi(request.getAfterEmi())
                                .build();

                PaymentEntity savedPayment = paymentRepository.save(payment);

                return PaymentResponse.builder()
                                .message("Payment added successfully")
                                .bankName(loan.getBankName())
                                .borrowerName(loan.getBorrowerName())
                                .amount(savedPayment.getAmount())
                                .afterEmi(savedPayment.getAfterEmi())
                                .build();
        }

        public BalanceResponse getBalance(
                        String bankName,
                        String borrowerName,
                        int targetEmi) {

                LoanEntity loan = findLoan(
                                bankName,
                                borrowerName);

                if (targetEmi < 0 || targetEmi > loan.getTotalMonths()) {
                        throw new InvalidInputException(
                                        "EMI number must be between 0 and " + loan.getTotalMonths());
                }

                List<PaymentEntity> payments = paymentRepository
                                .findByLoanIdAndAfterEmiLessThanEqual(
                                                loan.getId(),
                                                targetEmi);

                double totalAmount = loan.getTotalAmount();
                double emi = loan.getEmi();

                int emisPaid = Math.min(targetEmi, loan.getTotalMonths());
                double amountPaid = emisPaid * emi;

                for (PaymentEntity payment : payments) {
                        amountPaid += payment.getAmount();
                }

                amountPaid = Math.min(amountPaid, totalAmount);
                double remainingAmount = Math.max(totalAmount - amountPaid, 0.0);

                int emisLeft = (remainingAmount == 0)
                                ? 0
                                : (int) Math.ceil(
                                                remainingAmount / emi);

                return BalanceResponse.builder()
                                .bankName(loan.getBankName())
                                .borrowerName(loan.getBorrowerName())
                                .amountPaid((int) Math.round(amountPaid))
                                .emisLeft(emisLeft)
                                .build();

        }

        private LoanResponse mapToLoanResponse(
                        LoanEntity loan) {

                return LoanResponse.builder()
                                .bankName(loan.getBankName())
                                .borrowerName(loan.getBorrowerName())
                                .principal(loan.getPrincipal())
                                .years(loan.getYears())
                                .rate(loan.getRate())
                                .totalInterest(loan.getTotalInterest())
                                .totalAmount(loan.getTotalAmount())
                                .emi(loan.getEmi())
                                .totalMonths(loan.getTotalMonths())
                                .build();
        }
}
