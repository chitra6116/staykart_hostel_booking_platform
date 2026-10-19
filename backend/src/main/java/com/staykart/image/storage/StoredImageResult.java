package com.staykart.image.storage;

public record StoredImageResult(
    String originalPath,
    String thumbPath,
    String cardPath,
    String largePath
) {}
