package com.learningframe.api.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank() || value.length() < 8 || value.length() > 120) {
            return true;
        }

        return value.chars().anyMatch(Character::isUpperCase)
                && value.chars().anyMatch(Character::isDigit)
                && value.chars().anyMatch(this::isSymbol);
    }

    private boolean isSymbol(int codePoint) {
        return !Character.isLetterOrDigit(codePoint) && !Character.isWhitespace(codePoint);
    }
}
