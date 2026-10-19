package com.staykart.image.storage;

import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;

public interface ImageStorage {

    StoredImageResult storeImage(InputStream inputStream, String subDirectory) throws IOException;

    Resource loadAsResource(String relativePath) throws IOException;

    void delete(String relativePath);

    boolean exists(String relativePath);
}
