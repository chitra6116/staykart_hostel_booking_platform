package com.staykart;

import org.junit.jupiter.api.Test;
import javax.imageio.ImageIO;
import java.util.Arrays;

class ImageFormatTest {
    @Test
    void checkFormats() {
        System.out.println("READER_FORMATS=" + Arrays.toString(ImageIO.getReaderFormatNames()));
        System.out.println("WRITER_FORMATS=" + Arrays.toString(ImageIO.getWriterFormatNames()));
    }
}
