package com.staykart.image.entity;

import com.staykart.property.entity.Property;
import com.staykart.room.entity.Room;
import com.staykart.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "thumb_path", nullable = false)
    private String thumbPath;

    @Column(name = "card_path", nullable = false)
    private String cardPath;

    @Column(name = "large_path", nullable = false)
    private String largePath;

    @Column(name = "alt_text", nullable = false)
    private String altText;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    @Column(name = "is_cover", nullable = false)
    @Builder.Default
    private boolean cover = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private OffsetDateTime uploadedAt;
}
