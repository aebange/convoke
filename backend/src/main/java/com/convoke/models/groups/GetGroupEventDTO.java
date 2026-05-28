package com.convoke.models.groups;

import java.time.LocalDateTime;
import java.util.List;

public class GetGroupEventDTO {
    private int id;
    private int createdBy;
    private String title;
    private String description;
    private String status;
    private Integer confirmedDateId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<GetGroupEventDateDTO> dates;
    private List<GetGroupEventRsvpDTO> rsvps;
    private List<GetGroupEventCommentDTO> comments;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getConfirmedDateId() { return confirmedDateId; }
    public void setConfirmedDateId(Integer confirmedDateId) { this.confirmedDateId = confirmedDateId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<GetGroupEventDateDTO> getDates() { return dates; }
    public void setDates(List<GetGroupEventDateDTO> dates) { this.dates = dates; }

    public List<GetGroupEventRsvpDTO> getRsvps() { return rsvps; }
    public void setRsvps(List<GetGroupEventRsvpDTO> rsvps) { this.rsvps = rsvps; }

    public List<GetGroupEventCommentDTO> getComments() { return comments; }
    public void setComments(List<GetGroupEventCommentDTO> comments) { this.comments = comments; }
}
