package com.staykart.booking.service;

import com.staykart.booking.entity.BookingStatus;
import com.staykart.common.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class BookingStateMachine {

    private static final Map<BookingStatus, Set<BookingStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(BookingStatus.class);

    static {
        // PENDING can transition to CONFIRMED on payment, CANCELLED by user, or EXPIRED by timeout job
        ALLOWED_TRANSITIONS.put(BookingStatus.PENDING, EnumSet.of(BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.EXPIRED));

        // CONFIRMED can transition to CHECKED_IN on guest arrival, or CANCELLED before arrival
        ALLOWED_TRANSITIONS.put(BookingStatus.CONFIRMED, EnumSet.of(BookingStatus.CHECKED_IN, BookingStatus.CANCELLED));

        // CHECKED_IN can transition to CHECKED_OUT on departure
        ALLOWED_TRANSITIONS.put(BookingStatus.CHECKED_IN, EnumSet.of(BookingStatus.CHECKED_OUT));

        // Terminal states
        ALLOWED_TRANSITIONS.put(BookingStatus.CHECKED_OUT, EnumSet.noneOf(BookingStatus.class));
        ALLOWED_TRANSITIONS.put(BookingStatus.CANCELLED, EnumSet.noneOf(BookingStatus.class));
        ALLOWED_TRANSITIONS.put(BookingStatus.EXPIRED, EnumSet.noneOf(BookingStatus.class));
    }

    public void validateTransition(BookingStatus currentStatus, BookingStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return;
        }

        Set<BookingStatus> validNextStates = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, EnumSet.noneOf(BookingStatus.class));
        if (!validNextStates.contains(targetStatus)) {
            throw new BadRequestException("Illegal booking status transition from " + currentStatus + " to " + targetStatus);
        }
    }
}
