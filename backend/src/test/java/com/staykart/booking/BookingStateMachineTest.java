package com.staykart.booking;

import com.staykart.booking.entity.BookingStatus;
import com.staykart.booking.service.BookingStateMachine;
import com.staykart.common.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class BookingStateMachineTest {

    private BookingStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new BookingStateMachine();
    }

    @Test
    void shouldAllowValidPendingToConfirmed() {
        assertDoesNotThrow(() -> stateMachine.validateTransition(BookingStatus.PENDING, BookingStatus.CONFIRMED));
    }

    @Test
    void shouldAllowValidConfirmedToCheckedIn() {
        assertDoesNotThrow(() -> stateMachine.validateTransition(BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN));
    }

    @Test
    void shouldAllowValidCheckedInToCheckedOut() {
        assertDoesNotThrow(() -> stateMachine.validateTransition(BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT));
    }

    @Test
    void shouldAllowPendingToCancelledAndExpired() {
        assertDoesNotThrow(() -> stateMachine.validateTransition(BookingStatus.PENDING, BookingStatus.CANCELLED));
        assertDoesNotThrow(() -> stateMachine.validateTransition(BookingStatus.PENDING, BookingStatus.EXPIRED));
    }

    @Test
    void shouldRejectIllegalTransitions() {
        // Cannot jump directly from PENDING to CHECKED_IN
        assertThrows(BadRequestException.class, () -> stateMachine.validateTransition(BookingStatus.PENDING, BookingStatus.CHECKED_IN));

        // Cannot cancel already CHECKED_OUT booking
        assertThrows(BadRequestException.class, () -> stateMachine.validateTransition(BookingStatus.CHECKED_OUT, BookingStatus.CANCELLED));

        // Cannot confirm an EXPIRED booking
        assertThrows(BadRequestException.class, () -> stateMachine.validateTransition(BookingStatus.EXPIRED, BookingStatus.CONFIRMED));
    }
}
